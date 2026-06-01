export type UserRole = 'USER' | 'VENDOR' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'COD';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  image?: string;
  phone?: string;
  emailVerified: boolean;
  vendorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  images: string[];
  categoryId: string;
  tags: string[];
  attributes: Record<string, string>;
  variants: IProductVariant[];
  ratings: { average: number; count: number };
  vendorId?: string;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface ICartItem {
  productId: string;
  variantName?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface IOrder {
  id: string;
  userId: string;
  items: IOrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: IAddress;
  billingAddress: IAddress;
  couponId?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  productId: string;
  variantName?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BOGO';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}
