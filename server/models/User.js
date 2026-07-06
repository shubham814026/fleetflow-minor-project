import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
      required: true
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function userPreSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(input) {
  return bcrypt.compare(input, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
