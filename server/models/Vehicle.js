import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    model: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Truck', 'Van', 'Pickup', 'Trailer', 'Reefer', 'Other'],
      default: 'Other'
    },
    licensePlate: { type: String, required: true, unique: true, trim: true, uppercase: true },
    maxLoadCapacity: { type: Number, required: true, min: 1 },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    odometer: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
      default: 'Available'
    },
    outOfService: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
