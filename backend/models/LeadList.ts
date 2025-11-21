import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadList extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  totalLeads: number;
  activeLeads: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadListSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  totalLeads: {
    type: Number,
    default: 0,
  },
  activeLeads: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

LeadListSchema.index({ userId: 1 });

export default mongoose.model<ILeadList>('LeadList', LeadListSchema);
