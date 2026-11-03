import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/order";
import { getSession } from "@/lib/session";
import { displayFoodName } from "@/lib/food-utils";

export async function GET(request: NextRequest) {
  try {
    if ((await getSession(request))?.role !== "admin") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }
    const days = Number(request.nextUrl.searchParams.get("days") ?? 30);
    if (![7, 30, 90].includes(days)) {
      return NextResponse.json({ error: "Choose a 7, 30, or 90 day reporting period." }, { status: 400 });
    }
    await connectToDatabase();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const [summaries, bestSellers, dailySales] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            paidRevenue: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", "paid"] }, { $ne: ["$status", "cancelled"] }] }, "$total", 0] } },
            paidOrders: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", "paid"] }, { $ne: ["$status", "cancelled"] }] }, 1, 0] } },
            pendingPayments: { $sum: { $cond: [{ $and: [{ $eq: [{ $ifNull: ["$paymentStatus", "pending"] }, "pending"] }, { $ne: ["$status", "cancelled"] }] }, 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.food",
            name: { $first: "$items.name" },
            quantity: { $sum: "$items.quantity" },
            sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            paidRevenue: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$paymentStatus", "paid"] }, { $ne: ["$status", "cancelled"] }] },
                  "$total",
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const summary = summaries[0];
    return NextResponse.json({
      days,
      summary: summary ?? { orders: 0, cancelledOrders: 0, paidRevenue: 0, paidOrders: 0, pendingPayments: 0 },
      bestSellers: bestSellers.map((item) => ({
        id: item._id,
        name: displayFoodName(item.name),
        quantity: item.quantity,
        sales: item.sales,
      })),
      dailySales: dailySales.map((item) => ({
        date: item._id,
        orders: item.orders,
        paidRevenue: item.paidRevenue,
      })),
    });
  } catch (error) {
    console.error("Could not load sales report.", error);
    return NextResponse.json({ error: "Could not load sales reports." }, { status: 500 });
  }
}
