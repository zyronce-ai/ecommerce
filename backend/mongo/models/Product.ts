import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  vendor?: string;
  inStock: boolean;
  stock: number;
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  colors: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: Number,
    images: [String],
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    vendor: String,
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    specs: { type: Map, of: String, default: {} },
    colors: [String],
    tags: [String],
  },
  { timestamps: true },
);

ProductSchema.index({ name: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
