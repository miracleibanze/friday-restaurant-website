import { model, models, Schema, type Model, type HydratedDocument } from "mongoose";

export type UserRole = "customer" | "admin";

export interface UserFields {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  defaultAddress?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserFields>;

const userSchema = new Schema<UserFields>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, maxlength: 40 },
    defaultAddress: { type: String, trim: true, maxlength: 300 },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true },
);

export const User = (models.User as Model<UserFields> | undefined) ?? model<UserFields>("User", userSchema);