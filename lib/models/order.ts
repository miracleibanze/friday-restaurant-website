import {
  model,
  models,
  Schema,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export const orderStatuses = [
  "confirmed",
  "preparing",
  "on-the-way",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export interface OrderItemFields {
  food: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderFields {
  orderNumber: string;
  customerId: Types.ObjectId | null;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  items: OrderItemFields[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "mobile-money" | "card" | "cash";
  status: OrderStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<OrderFields>;

const orderSchema = new Schema<OrderFields>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    deliveryAddress: { type: String, required: true, trim: true, maxlength: 300 },
    items: [
      {
        food: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 20 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["mobile-money", "card", "cash"],
      required: true,
    },
    status: { type: String, enum: orderStatuses, default: "confirmed", index: true },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

orderSchema.index({ createdAt: -1 });

export const Order = (models.Order as Model<OrderFields> | undefined) ?? model<OrderFields>("Order", orderSchema);