import { model, models, Schema, type Model, type HydratedDocument } from "mongoose";

export type ContactMessageStatus = "new" | "read" | "resolved";

export interface ContactMessageFields {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactMessageDocument = HydratedDocument<ContactMessageFields>;

const contactMessageSchema = new Schema<ContactMessageFields>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage =
  (models.ContactMessage as Model<ContactMessageFields> | undefined) ??
  model<ContactMessageFields>("ContactMessage", contactMessageSchema);
