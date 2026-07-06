import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    cargoDescription: { type: String, trim: true },
    cargoWeight: { type: Number, required: true, min: 1 },
    plannedDistanceKm: { type: Number, required: true, min: 1 },
    actualDistanceKm: { type: Number, min: 0, default: 0 },
    revenue: { type: Number, min: 0, default: 0 },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft'
    },
    dispatchedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
