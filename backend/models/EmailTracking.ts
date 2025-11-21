import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTracking extends Document {
  campaignId: mongoose.Types.ObjectId;
  campaignToken: string;
  leadId: mongoose.Types.ObjectId;
  email: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam' | 'unsubscribed' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  spamReportedAt?: Date;
  unsubscribedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  clickedLinks: Array<{
    url: string;
    clickedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTrackingSchema: Schema = new Schema({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  campaignToken: {
    type: String,
    required: true,
    index: true,
  },
  leadId: {
    type: Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'spam', 'unsubscribed', 'failed'],
    default: 'queued',
  },
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  bouncedAt: Date,
  spamReportedAt: Date,
  unsubscribedAt: Date,
  failedAt: Date,
  failureReason: String,
  ipAddress: String,
  userAgent: String,
  clickedLinks: [{
    url: { type: String, required: true },
    clickedAt: { type: Date, required: true },
    ipAddress: String,
    userAgent: String,
  }],
  openCount: {
    type: Number,
    default: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
EmailTrackingSchema.index({ campaignToken: 1 });
EmailTrackingSchema.index({ campaignId: 1, status: 1 });
EmailTrackingSchema.index({ leadId: 1 });

export default mongoose.model<IEmailTracking>('EmailTracking', EmailTrackingSchema);