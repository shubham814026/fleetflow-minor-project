import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['On Duty', 'Off Duty', 'Suspended', 'On Trip'],
      default: 'On Duty'
    },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 }
  },
  { timestamps: true }
);

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
