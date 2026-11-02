import type { OrderDocument } from "@/lib/models/order";
import type { UserDocument } from "@/lib/models/user";
import { displayFoodName } from "@/lib/accompaniments";

export function serializeUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    defaultAddress: user.defaultAddress,
    role: user.role,
  };
}

export function serializeOrder(order: OrderDocument) {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId?.toString() ?? null,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((item) => ({
      food: item.food,
      name: displayFoodName(item.name),
      price: item.price,
      quantity: item.quantity,
      accompaniments: {
        chips: item.accompaniments?.chips ?? 0,
        samosa: item.accompaniments?.samosa ?? 0,
        pilau: item.accompaniments?.pilau ?? 0,
      },
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus ?? "pending",
    paymentReference: order.paymentReference ?? "",
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
  };
}