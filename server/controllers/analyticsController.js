import FuelLog from '../models/FuelLog.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAnalytics = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().lean();

  const [fuelAgg, maintenanceAgg, tripAgg] = await Promise.all([
    FuelLog.aggregate([
      { $group: { _id: '$vehicle', liters: { $sum: '$liters' }, fuelCost: { $sum: '$cost' } } }
    ]),
    MaintenanceLog.aggregate([
      { $group: { _id: '$vehicle', maintenanceCost: { $sum: '$cost' } } }
    ]),
    Trip.aggregate([
      {
        $group: {
          _id: '$vehicle',
          distanceKm: { $sum: '$actualDistanceKm' },
          revenue: { $sum: '$revenue' }
        }
      }
    ])
  ]);

  const fuelMap = new Map(fuelAgg.map((row) => [String(row._id), row]));
  const maintenanceMap = new Map(maintenanceAgg.map((row) => [String(row._id), row]));
  const tripMap = new Map(tripAgg.map((row) => [String(row._id), row]));

  const rows = vehicles.map((vehicle) => {
    const fuel = fuelMap.get(String(vehicle._id)) || { liters: 0, fuelCost: 0 };
    const maintenance = maintenanceMap.get(String(vehicle._id)) || { maintenanceCost: 0 };
    const trip = tripMap.get(String(vehicle._id)) || { distanceKm: 0, revenue: 0 };

    const liters = Number(fuel.liters || 0);
    const distanceKm = Number(trip.distanceKm || 0);
    const fuelEfficiency = liters ? Number((distanceKm / liters).toFixed(2)) : 0;

    const revenue = Number(trip.revenue || 0);
    const fuelCost = Number(fuel.fuelCost || 0);
    const maintenanceCost = Number(maintenance.maintenanceCost || 0);
    const acquisitionCost = Number(vehicle.acquisitionCost || 0);

    const roi = acquisitionCost
      ? Number(((revenue - (maintenanceCost + fuelCost)) / acquisitionCost).toFixed(4))
      : 0;

    return {
      vehicleId: vehicle._id,
      vehicle: `${vehicle.model} (${vehicle.licensePlate})`,
      distanceKm,
      liters,
      fuelCost,
      maintenanceCost,
      revenue,
      fuelEfficiency,
      roi
    };
  });

  res.json({
    rows,
    chartData: {
      labels: rows.map((row) => row.vehicle),
      fuelEfficiency: rows.map((row) => row.fuelEfficiency),
      roi: rows.map((row) => Number((row.roi * 100).toFixed(2)))
    }
  });
});

export { getAnalytics };
