import { INITIAL_DRIVERS } from '../../../client/src/api/mockData.js';

let DRIVERS = [...INITIAL_DRIVERS];

export const getDrivers = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  let filtered = [...DRIVERS];

  if (status) {
    filtered = filtered.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (d) => d.name.toLowerCase().includes(s) || d.email.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit, 10));

  return res.json({
    success: true,
    data: paginated,
    meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
  });
};

export const getDriverById = async (req, res) => {
  const { id } = req.params;
  const driver = DRIVERS.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Driver ${id} not found` }
    });
  }

  // Hide sensitive PII if secondary auth header is missing
  const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
  const responseData = { ...driver };

  if (!hasSecondaryAuth) {
    delete responseData.sensitive;
  }

  return res.json({ success: true, data: responseData });
};

export const createDriver = async (req, res) => {
  const body = req.body;
  const newD = {
    id: `drv-${Date.now()}`,
    status: 'Active',
    safetyScore: 90,
    totalTrips: 0,
    rating: 5.0,
    joinedDate: new Date().toISOString().split('T')[0],
    ...body
  };

  DRIVERS.unshift(newD);
  return res.status(201).json({ success: true, data: newD });
};

export const updateDriverStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let updated = null;
  DRIVERS = DRIVERS.map((d) => {
    if (d.id === id) {
      updated = { ...d, status };
      return updated;
    }
    return d;
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Driver ${id} not found` }
    });
  }

  return res.json({ success: true, data: updated });
};

export const getSafetyMetrics = async (req, res) => {
  return res.json({
    success: true,
    data: {
      overallSafetyScore: 89,
      totalSpeedingEvents: 14,
      harshBrakingEvents: 8,
      harshAccelerationEvents: 5,
      leaderboard: [...DRIVERS].sort((a, b) => b.safetyScore - a.safetyScore)
    }
  });
};

export { DRIVERS };
