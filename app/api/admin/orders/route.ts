import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { serializeOrder } from "@/lib/api-serializers";
import { Order, orderStatuses, paymentStatuses } from "@/lib/models/order";
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
    const paymentStatus = params.get("paymentStatus") ?? "all";
    const search = params.get("search")?.trim().slice(0, 100) ?? "";
    const requestedPage = Number(params.get("page") ?? 1);
    const pageSize = Number(params.get("pageSize") ?? 20);
    if (!Number.isInteger(requestedPage) || requestedPage < 1) {
      return NextResponse.json({ error: "Page must be a positive integer." }, { status: 400 });
    }
    if (![10, 20, 50, 100].includes(pageSize)) {
      return NextResponse.json({ error: "Page size must be 10, 20, 50, or 100." }, { status: 400 });
    }
    const filter: Record<string, unknown> = {};
    if (status !== "all" && orderStatuses.includes(status as (typeof orderStatuses)[number])) {
      filter.status = status;
    }
    if (paymentStatus !== "all" && paymentStatus === "pending") {
      filter.$or = [{ paymentStatus: "pending" }, { paymentStatus: { $exists: false } }];
    } else if (paymentStatus !== "all" && ["paid", "failed"].includes(paymentStatus)) {
      filter.paymentStatus = paymentStatus;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchConditions = [
        { orderNumber: { $regex: escaped, $options: "i" } },
        { customerName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { phone: { $regex: escaped, $options: "i" } },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const [total, statusCounts] = await Promise.all([
      Order.countDocuments(filter),
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);
    const pages = Math.ceil(total / pageSize);
    const page = pages ? Math.min(requestedPage, pages) : 1;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const counts = Object.fromEntries(orderStatuses.map((value) => [value, 0]));
    for (const entry of statusCounts) counts[entry._id] = entry.count;
    return NextResponse.json({
      orders: orders.map(serializeOrder),
      counts,
      total,
      page,
      pageSize,
      pages,
    });
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
    const updates: Record<string, string> = {};
    if (body.status !== undefined) {
      if (!orderStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Select a valid order status." }, { status: 400 });
      }
      updates.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      if (!paymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json({ error: "Select a valid payment status." }, { status: 400 });
      }
      updates.paymentStatus = body.paymentStatus;
      const reference = typeof body.paymentReference === "string" ? body.paymentReference.trim() : "";
      if (reference.length > 100) {
        return NextResponse.json({ error: "Payment reference must be 100 characters or fewer." }, { status: 400 });
      }
      updates.paymentReference = reference;
    }
    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: "Provide an order or payment status to update." }, { status: 400 });
    }
    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(
      body.id,
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error("Could not update order status.", error);
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const id = request.nextUrl.searchParams.get("id");
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: "A valid order id is required." }, { status: 400 });
    }
    await connectToDatabase();
    const order = await Order.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Could not delete order.", error);
    return NextResponse.json({ error: "Could not delete order." }, { status: 500 });
  }
}