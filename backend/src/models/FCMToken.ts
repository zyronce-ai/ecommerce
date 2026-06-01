import mongoose, { Schema, Document } from 'mongoose';

export interface IFCMToken extends Document {
  userId: string;
  token: string;
  device: string;
  createdAt: Date;
  updatedAt: Date;
}

const FCMTokenSchema = new Schema<IFCMToken>({ userId: { type: String, required: true, index: true }, token: { type: String, required: true, unique: true }, device: { type: String, default: 'unknown' } }, { timestamps: true });

export const FCMToken = mongoose.model<IFCMToken>('FCMToken', FCMTokenSchema);
