import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    liters: { type: Number, required: true, min: 0.1 },
    cost: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);

export default FuelLog;
