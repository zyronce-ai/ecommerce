export const TEMPLATES = {
  orderConfirmed: (id: string) => ({ title: 'Order Confirmed 🎉', body: `Your order ${id} has been confirmed.` }),
  orderShipped: (id: string) => ({ title: 'Order Shipped 📦', body: `Your order ${id} is on its way!` }),
  orderDelivered: (id: string) => ({ title: 'Order Delivered ✅', body: `Your order ${id} has been delivered.` }),
  dealAlert: (name: string, discount: number) => ({ title: '🔥 Flash Deal!', body: `${name} is now ${discount}% off!` }),
  priceDrop: (name: string, price: number) => ({ title: '💰 Price Dropped!', body: `${name} is now at ₹${price}.` }),
  backInStock: (name: string) => ({ title: 'Back in Stock!', body: `${name} is back in stock!` }),
};
