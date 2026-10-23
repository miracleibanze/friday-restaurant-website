import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getDatabase } from "@/lib/mongodb";
import { getSession } from "@/lib/server-auth";

export const runtime = "nodejs";

const statuses = ["confirmed", "preparing", "on-the-way", "delivered", "cancelled"] as const;
type OrderStatus = (typeof statuses)[number];
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
  paymentMethod: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

function serialize(order: OrderDocument) {
  return {
    ...order,
    id: order._id.toString(),
    customerId: order.customerId?.toString() || null,
    _id: undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return apiError("Admin access is required.", 401);

  const status = request.nextUrl.searchParams.get("status") || "all";
  const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 100);
  if (status !== "all" && !statuses.includes(status as OrderStatus)) {
    return apiError("Invalid order status filter.", 400);
  }

  try {
    const db = await getDatabase();
    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: escapeRegex(search), $options: "i" } },
        { customerName: { $regex: escapeRegex(search), $options: "i" } },
        { email: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }
    const [orders, total] = await Promise.all([
      db.collection<OrderDocument>("orders").find(filter).sort({ createdAt: -1 }).limit(200).toArray(),
      db.collection<OrderDocument>("orders").countDocuments(),
    ]);
    const statusCounts = await db.collection<OrderDocument>("orders").aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray();
    return NextResponse.json({
      orders: orders.map(serialize),
      total,
      counts: Object.fromEntries(statusCounts.map((item) => [item._id, item.count])),
    });
  } catch (error) {
    console.error("Could not load admin orders.", error);
    return apiError("The admin order service is unavailable.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return apiError("Admin access is required.", 401);

  let body: { id?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return apiError("Request body must be valid JSON.", 400);
  }
  if (
    typeof body.id !== "string" ||
    !ObjectId.isValid(body.id) ||
    typeof body.status !== "string" ||
    !statuses.includes(body.status as OrderStatus)
  ) {
    return apiError("Provide a valid order ID and status.", 400);
  }

  try {
    const db = await getDatabase();
    const result = await db.collection<OrderDocument>("orders").findOneAndUpdate(
      { _id: new ObjectId(body.id) },
      { $set: { status: body.status as OrderStatus, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!result) return apiError("Order not found.", 404);
    return NextResponse.json({ order: serialize(result) });
  } catch (error) {
    console.error("Could not update order status.", error);
    return apiError("Could not update this order.", 503);
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
