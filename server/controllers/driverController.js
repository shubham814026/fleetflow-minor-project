import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import asyncHandler from '../utils/asyncHandler.js';

const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find().sort({ createdAt: -1 }).lean();

  const completionAgg = await Trip.aggregate([
    {
      $group: {
        _id: '$driver',
        totalTrips: { $sum: 1 },
        completedTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const completionMap = new Map(completionAgg.map((item) => [String(item._id), item]));

  const enriched = drivers.map((driver) => {
    const stats = completionMap.get(String(driver._id));
    const total = stats?.totalTrips || 0;
    const completed = stats?.completedTrips || 0;
    const completionRate = total ? Number(((completed / total) * 100).toFixed(2)) : 0;

    return {
      ...driver,
      completionRate
    };
  });

  res.json(enriched);
});

const createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create(req.body);
  res.status(201).json(driver);
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }

  Object.assign(driver, req.body);
  const updated = await driver.save();
  res.json(updated);
});

const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    res.status(404);
    throw new Error('Driver not found');
  }

  const activeTrip = await Trip.findOne({
    driver: driver._id,
    status: { $in: ['Draft', 'Dispatched'] }
  });

  if (activeTrip) {
    res.status(400);
    throw new Error('Cannot delete driver with active trip');
  }

  await driver.deleteOne();
  res.json({ message: 'Driver deleted' });
});

export { getDrivers, createDriver, updateDriver, deleteDriver };
