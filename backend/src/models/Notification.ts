import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['ORDER', 'DEAL', 'PRICE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    read: { type: Boolean, default: false, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    link: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<any>) ||
  mongoose.model('Notification', NotificationSchema);
