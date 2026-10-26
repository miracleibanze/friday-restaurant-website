import { randomBytes } from "node:crypto";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getMenuItems } from "@/lib/menu-catalog";
import { serializeOrder } from "@/lib/api-serializers";
import { Order } from "@/lib/models/order";
import { User } from "@/lib/models/user";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const orderNumber = request.nextUrl.searchParams.get("orderNumber")?.trim();
    if (orderNumber) {
      const order = await Order.findOne({ orderNumber }).lean();
      if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
      return NextResponse.json({
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus ?? "pending",
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map(({ name, quantity }) => ({ name, quantity })),
        },
      });
    }

    const session = await getSession(request);
    if (!session || session.role !== "customer" || !isValidObjectId(session.sub)) {
      return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
    }
    const orders = await Order.find({ customerId: session.sub }).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ orders: orders.map(serializeOrder) });
  } catch (error) {
    console.error("Could not load orders.", error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : "";
    const paymentMethod = body.paymentMethod;
    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !address) {
      return NextResponse.json({ error: "Complete your name, email, phone, and delivery address." }, { status: 400 });
    }
    if (!["mobile-money", "card", "cash"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Select a valid payment method." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
      return NextResponse.json({ error: "Your order must include at least one menu item." }, { status: 400 });
    }

    const menuItems = await getMenuItems();
    const requestedItems = body.items as Array<{ food?: unknown; quantity?: unknown }>;
    const items = [];
    for (const requested of requestedItems) {
      if (typeof requested.food !== "string" || !Number.isInteger(requested.quantity) || Number(requested.quantity) < 1 || Number(requested.quantity) > 20) {
        return NextResponse.json({ error: "One or more order quantities are invalid." }, { status: 400 });
      }
      const food = menuItems.find((menuItem) => menuItem.id === requested.food && menuItem.available);
      if (!food) return NextResponse.json({ error: "One or more selected menu items are unavailable." }, { status: 400 });
      items.push({ food: food.id, name: food.name, price: food.price, quantity: Number(requested.quantity) });
    }

    const session = await getSession(request);
    const customerId = session?.role === "customer" && isValidObjectId(session.sub) ? session.sub : null;
    await connectToDatabase();
    if (customerId) {
      const user = await User.findById(customerId);
      if (!user) return NextResponse.json({ error: "Your account could not be verified." }, { status: 401 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 30_000 ? 0 : 2_000;
    const order = await Order.create({
      orderNumber: `FR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`,
      customerId,
      customerName: name,
      email,
      phone,
      deliveryAddress: address,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod,
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "",
      status: "confirmed",
    });
    return NextResponse.json({ order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    console.error("Could not create order.", error);
    return NextResponse.json({ error: "Could not place your order." }, { status: 500 });
  }
}