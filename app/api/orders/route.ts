import { randomInt } from "node:crypto";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { menuFoods } from "@/lib/menu-data";
import { getDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/server-auth";

export const runtime = "nodejs";

type OrderStatus = "confirmed" | "preparing" | "on-the-way" | "delivered" | "cancelled";
type OrderDocument = {
  _id: ObjectId;
  orderNumber: string;
  customerId: ObjectId | null;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  notes: string;
  items: Array<{ food: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "mobile-money" | "card" | "cash";
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

function serializeOrder(order: OrderDocument) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId?.toString() || null,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  const orderNumber = request.nextUrl.searchParams.get("orderNumber")?.trim();

  if (!session && !orderNumber) {
    return apiError("Sign in to view your orders.", 401);
  }
  if (session?.role === "admin") {
    return apiError("Use the admin orders endpoint.", 403);
  }
  if (session && session.role === "customer" && !ObjectId.isValid(session.id)) {
    return apiError("Invalid account session.", 401);
  }
  if (!session && (!orderNumber || orderNumber.length > 30)) {
    return apiError("Enter a valid order number.", 400);
  }

  try {
    const db = await getDatabase();
    const orders = db.collection<OrderDocument>("orders");
    if (orderNumber) {
      const order = await orders.findOne(
        { orderNumber: orderNumber.toUpperCase() },
        { projection: { customerName: 0, email: 0, phone: 0, deliveryAddress: 0, notes: 0 } },
      );
      return NextResponse.json({
        order: order
          ? {
              id: order._id.toString(),
              orderNumber: order.orderNumber,
              status: order.status,
              items: order.items,
              total: order.total,
              createdAt: order.createdAt.toISOString(),
            }
          : null,
      });
    }

    const result = await orders
      .find({ customerId: new ObjectId(session!.id) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ orders: result.map(serializeOrder) });
  } catch (error) {
    console.error("Could not retrieve orders.", error);
    return apiError("The order service is unavailable. Please try again.", 503);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }

  const session = await getSession();
  if (session?.role === "admin") return apiError("Admin accounts cannot place orders.", 403);
  if (session && !ObjectId.isValid(session.id)) return apiError("Invalid account session.", 401);

  const customerName =
    typeof body.customerName === "string"
      ? body.customerName.trim()
      : session?.name || "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : session?.email || "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const deliveryAddress =
    typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const paymentMethods = ["mobile-money", "card", "cash"] as const;
  const paymentMethod = body.paymentMethod;
  const requestedItems = body.items;

  if (
    !customerName ||
    customerName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.length < 6 ||
    phone.length > 40 ||
    deliveryAddress.length < 5 ||
    deliveryAddress.length > 500 ||
    notes.length > 1000
  ) {
    return apiError("Check the customer and delivery details.", 400);
  }
  if (
    !paymentMethods.includes(paymentMethod as (typeof paymentMethods)[number]) ||
    !Array.isArray(requestedItems) ||
    requestedItems.length < 1 ||
    requestedItems.length > 30
  ) {
    return apiError("Check the payment method and order items.", 400);
  }

  const items: OrderDocument["items"] = [];
  for (const requested of requestedItems) {
    if (!requested || typeof requested !== "object") {
      return apiError("An order item is invalid.", 400);
    }
    const item = requested as { food?: unknown; quantity?: unknown };
    const food = menuFoods.find((menuFood) => menuFood.id === item.food);
    const quantity = item.quantity;
    if (!food || !food.available || !Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > 50) {
      return apiError("An order item is unavailable or has an invalid quantity.", 400);
    }
    items.push({
      food: food.id,
      name: food.name,
      price: food.price,
      quantity: Number(quantity),
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 30_000 ? 0 : 2_000;
  const now = new Date();
  const order: OrderDocument = {
    _id: new ObjectId(),
    orderNumber: `FR-${Date.now().toString().slice(-7)}${randomInt(10, 100)}`,
    customerId: session ? new ObjectId(session.id) : null,
    customerName,
    email,
    phone,
    deliveryAddress,
    notes,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    paymentMethod: paymentMethod as OrderDocument["paymentMethod"],
    status: "confirmed",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const db = await getDatabase();
    await db.collection<OrderDocument>("orders").insertOne(order);
    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    console.error("Could not save order.", error);
    return apiError("We could not place the order. Please try again.", 503);
  }
}
