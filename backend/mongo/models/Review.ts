import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  { product: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, user: { type: String, required: true }, name: String, rating: { type: Number, required: true, min: 1, max: 5 }, title: String, comment: String },
  { timestamps: true },
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
