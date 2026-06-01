import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  type: 'PERCENTAGE' | 'FLAT';
  minOrder: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  { code: { type: String, required: true, unique: true, uppercase: true }, discount: { type: Number, required: true }, type: { type: String, enum: ['PERCENTAGE', 'FLAT'], default: 'PERCENTAGE' }, minOrder: { type: Number, default: 0 }, maxUses: { type: Number, default: 100 }, usedCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true }, expiresAt: Date },
  { timestamps: true },
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
