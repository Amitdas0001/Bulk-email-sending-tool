import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  userId: mongoose.Types.ObjectId;
  leadListId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  companyName?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  tags: string[];
  customFields: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leadListId: {
    type: Schema.Types.ObjectId,
    ref: 'LeadList',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

LeadSchema.index({ userId: 1, leadListId: 1, email: 1 }, { unique: true });
LeadSchema.index({ leadListId: 1 });

export default mongoose.model<ILead>('Lead', LeadSchema);