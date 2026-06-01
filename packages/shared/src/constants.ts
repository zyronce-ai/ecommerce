export const ROLES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  COD: 'COD',
} as const;

export const COUPON_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FLAT: 'FLAT',
  BOGO: 'BOGO',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  PRODUCTS: 300,
  CATEGORIES: 600,
  CART: 86400,
} as const;
