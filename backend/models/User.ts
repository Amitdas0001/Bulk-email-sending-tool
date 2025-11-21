

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface SmtpSettings {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export interface IUser extends Document {
  
  _id: mongoose.Schema.Types.ObjectId; 
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  smtp?: SmtpSettings;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  smtp: {
    host: { type: String, trim: true },
    port: { type: Number },
    user: { type: String, trim: true },
    pass: { type: String },
  }
}, {
  timestamps: true,
});


UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
        next(error);
    } else {
        next(new Error('An unknown error occurred during password hashing.'));
    }
  }
});


UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);