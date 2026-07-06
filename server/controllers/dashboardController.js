import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import asyncHandler from '../utils/asyncHandler.js';

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const { type, status } = req.query;

  const vehicleFilter = {};
  if (type) vehicleFilter.type = type;
  if (status) vehicleFilter.status = status;

  const [vehicles, onTripCount, inShopCount, pendingCargoCount, totalVehicles] = await Promise.all([
    Vehicle.find(vehicleFilter).sort({ updatedAt: -1 }).limit(25),
    Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' }),
    Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' }),
    Trip.countDocuments({ status: 'Draft' }),
    Vehicle.countDocuments(vehicleFilter)
  ]);

  const utilizationRate = totalVehicles ? Number(((onTripCount / totalVehicles) * 100).toFixed(2)) : 0;

  res.json({
    kpis: {
      activeFleet: onTripCount,
      maintenanceAlerts: inShopCount,
      utilizationRate,
      pendingCargo: pendingCargoCount
    },
    vehicles
  });
});

export { getDashboardMetrics };
