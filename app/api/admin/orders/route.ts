import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { serializeOrder } from "@/lib/api-serializers";
import { Order, orderStatuses } from "@/lib/models/order";
import { getSession } from "@/lib/session";

async function requireAdmin(request: NextRequest) {
  const session = await getSession(request);
  return session?.role === "admin" ? session : null;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const status = params.get("status") ?? "all";
    const search = params.get("search")?.trim().slice(0, 100) ?? "";
    const filter: Record<string, unknown> = {};
    if (status !== "all" && orderStatuses.includes(status as (typeof orderStatuses)[number])) {
      filter.status = status;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { orderNumber: { $regex: escaped, $options: "i" } },
        { customerName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
      ];
    }

    const [orders, total, statusCounts] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).limit(250),
      Order.countDocuments(filter),
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    const counts = Object.fromEntries(orderStatuses.map((value) => [value, 0]));
    for (const entry of statusCounts) counts[entry._id] = entry.count;
    return NextResponse.json({ orders: orders.map(serializeOrder), counts, total });
  } catch (error) {
    console.error("Could not load administrator orders.", error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const body = await request.json();
    if (typeof body.id !== "string" || !isValidObjectId(body.id)) {
      return NextResponse.json({ error: "A valid order id is required." }, { status: 400 });
    }
    if (!orderStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Select a valid order status." }, { status: 400 });
    }
    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(
      body.id,
      { $set: { status: body.status } },
      { new: true, runValidators: true },
    );
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error("Could not update order status.", error);
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  }
}