import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  storeEmail: string;
  phone: string;
  address: string;
  currency: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  guestCheckout: boolean;
  bannerUrl: string;
}

const SettingsSchema = new Schema<ISettings>({
  storeName: { type: String, default: 'ShopHub' },
  storeEmail: { type: String, default: 'admin@shophub.com' },
  phone: { type: String, default: '+91 1234567890' },
  address: { type: String, default: 'Mumbai, India' },
  currency: { type: String, default: 'INR' },
  maintenanceMode: { type: Boolean, default: false },
  allowRegistration: { type: Boolean, default: true },
  guestCheckout: { type: Boolean, default: true },
  bannerUrl: { type: String, default: '' },
}, { timestamps: true });

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
