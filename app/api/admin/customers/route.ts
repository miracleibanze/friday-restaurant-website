import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { User } from "@/lib/models/user";
import { getSession } from "@/lib/session";
import { displayFoodName } from "@/lib/accompaniments";

export async function GET(request: NextRequest) {
  try {
    if ((await getSession(request))?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    await connectToDatabase();
    const params = request.nextUrl.searchParams;
    const customerId = params.get("customerId");
    if (customerId) {
      if (!isValidObjectId(customerId)) {
        return NextResponse.json({ error: "A valid customer id is required." }, { status: 400 });
      }
      const requestedPage = Number(params.get("page") ?? 1);
      const pageSize = Number(params.get("pageSize") ?? 20);
      if (!Number.isInteger(requestedPage) || requestedPage < 1) {
        return NextResponse.json({ error: "Page must be a positive integer." }, { status: 400 });
      }
      if (![10, 20, 50].includes(pageSize)) {
        return NextResponse.json({ error: "Page size must be 10, 20, or 50." }, { status: 400 });
      }
      const customer = await User.findOne({ _id: customerId, role: "customer" })
        .select("name email phone defaultAddress createdAt")
        .lean();
      if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
      const total = await Order.countDocuments({ customerId });
      const pages = Math.ceil(total / pageSize);
      const page = pages ? Math.min(requestedPage, pages) : 1;
      const orders = await Order.find({ customerId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
      return NextResponse.json({
        customer: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? "",
          defaultAddress: customer.defaultAddress ?? "",
          createdAt: customer.createdAt.toISOString(),
        },
        orders: orders.map((order) => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus ?? "pending",
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => `${item.quantity} × ${displayFoodName(item.name)}`),
        })),
        total,
        page,
        pageSize,
        pages,
      });
    }
    const search = params.get("search")?.trim().slice(0, 100) ?? "";
    const requestedPage = Number(params.get("page") ?? 1);
    const pageSize = 50;
    if (!Number.isInteger(requestedPage) || requestedPage < 1) {
      return NextResponse.json({ error: "Page must be a positive integer." }, { status: 400 });
    }
    const filter: Record<string, unknown> = { role: "customer" };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / pageSize);
    const page = pages ? Math.min(requestedPage, pages) : 1;
    const users = await User.find(filter)
      .select("name email phone defaultAddress createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const customerIds = users.map((user) => user._id);
    const aggregates = await Order.aggregate([
      { $match: { customerId: { $in: customerIds } } },
      {
        $group: {
          _id: "$customerId",
          orderCount: { $sum: 1 },
          lifetimeSpend: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "cancelled"] },
                    { $eq: ["$paymentStatus", "paid"] },
                  ],
                },
                "$total",
                0,
              ],
            },
          },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]);
    const stats = new Map(aggregates.map((entry) => [entry._id.toString(), entry]));
    return NextResponse.json({
      customers: users.map((user) => {
        const summary = stats.get(user._id.toString());
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          defaultAddress: user.defaultAddress ?? "",
          createdAt: user.createdAt.toISOString(),
          orderCount: summary?.orderCount ?? 0,
          lifetimeSpend: summary?.lifetimeSpend ?? 0,
          lastOrderAt: summary?.lastOrderAt?.toISOString() ?? null,
        };
      }),
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error("Could not load administrator customers.", error);
    return NextResponse.json({ error: "Could not load customers." }, { status: 500 });
  }
}
