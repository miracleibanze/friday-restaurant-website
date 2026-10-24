import type { OrderDocument } from "@/lib/models/order";
import type { UserDocument } from "@/lib/models/user";

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
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
  };
}