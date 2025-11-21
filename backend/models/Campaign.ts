import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  campaignToken: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments: Array<{
    filename: string;
    path: string;
    contentType: string;
  }>;
  status: 'draft' | 'sending' | 'sent' | 'paused';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  spamCount: number;
  unsubscribeCount: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

const CampaignSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  campaignToken: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
  },
  attachments: [{
    filename: { type: String, required: true },
    path: { type: String, required: true },
    contentType: { type: String, required: true },
  }],
  status: {
    type: String,
    enum: ['draft', 'sending', 'sent', 'paused'],
    default: 'draft',
  },
  totalRecipients: {
    type: Number,
    default: 0,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
  openCount: {
    type: Number,
    default: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  spamCount: {
    type: Number,
    default: 0,
  },
  unsubscribeCount: {
    type: Number,
    default: 0,
  },
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);