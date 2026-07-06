import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    serviceType: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    cost: { type: Number, required: true, min: 0 },
    serviceDate: { type: Date, required: true },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

export default MaintenanceLog;
