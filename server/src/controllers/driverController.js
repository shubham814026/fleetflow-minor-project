import { INITIAL_DRIVERS } from '../../../client/src/api/mockData.js';
import prisma from '../repositories/store.js';

let DRIVERS = [...INITIAL_DRIVERS];

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const formatDriver = (d) => {
  const assigned = d.driver_vehicle?.[0]?.vehicles;
  const user = d.users;
  return {
    id: d.id,
    userId: d.user_id,
    name: user?.name || 'Fleet Driver',
    email: user?.email || `driver.${d.id.slice(0, 6)}@smartfleet.ai`,
    phone: d.contact || user?.phone || '+91 98765 43210',
    status: d.status === 'active' ? 'Active' : d.status === 'suspended' ? 'Suspended' : 'Inactive',
    assignedVehicleId: assigned?.id || null,
    assignedVehicleReg: assigned?.registration_number || 'Unassigned',
    licenseExpiry: d.license_expiry ? new Date(d.license_expiry).toISOString().split('T')[0] : '2028-06-30',
    experienceYears: 6,
    safetyScore: 92,
    totalTrips: 28,
    rating: 4.8,
    joinedDate: d.joining_date ? new Date(d.joining_date).toISOString().split('T')[0] : '2023-01-10',
    sensitive: {
      aadhaarNo: 'XXXX-XXXX-9012',
      panNo: 'ABCDE1234F',
      licenseNumber: d.license_number || 'DL-0420110098712',
      address: 'Logistics Terminal, Sector 4',
      emergencyContact: '+91 98765 00000',
      bankAccountNumber: '91823746192837',
      bankIfsc: 'HDFC0001234'
    }
  };
};

export const getDrivers = async (req, res) => {
  const { page = 1, limit = 50, status, search } = req.query;

  try {
    const where = {};
    if (status && status !== 'all') {
      const dbStatus = status.toLowerCase() === 'active' ? 'active' : status.toLowerCase();
      where.status = { equals: dbStatus };
    }
    if (search) {
      where.OR = [
        { contact: { contains: search, mode: 'insensitive' } },
        { license_number: { contains: search, mode: 'insensitive' } },
        { users: { name: { contains: search, mode: 'insensitive' } } },
        { users: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [dbDrivers, total] = await Promise.all([
      prisma.drivers.findMany({
        where,
        take: parseInt(limit, 10),
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        orderBy: { created_at: 'desc' },
        include: {
          users: true,
          driver_vehicle: {
            take: 1,
            include: { vehicles: true }
          }
        }
      }),
      prisma.drivers.count({ where })
    ]);

    if (dbDrivers) {
      const formatted = dbDrivers.map(formatDriver);
      return res.json({
        success: true,
        data: formatted,
        meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
      });
    }
  } catch (err) {
    console.warn('Prisma getDrivers error, using fallback:', err.message);
  }

  // Fallback to in-memory
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

  try {
    if (isUuid(id)) {
      const d = await prisma.drivers.findFirst({
        where: {
          OR: [
            { id: id },
            { user_id: id }
          ]
        },
        include: {
          users: true,
          driver_vehicle: {
            take: 1,
            include: { vehicles: true }
          }
        }
      });

      if (d) {
        const formatted = formatDriver(d);
        const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
        if (!hasSecondaryAuth) {
          delete formatted.sensitive;
        }
        return res.json({ success: true, data: formatted });
      }
    }
  } catch (err) {
    console.warn('Prisma getDriverById error, using fallback:', err.message);
  }

  const driver = DRIVERS.find((d) => d.id === id);
  if (!driver) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Driver ${id} not found` }
    });
  }

  const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
  const responseData = { ...driver };
  if (!hasSecondaryAuth) {
    delete responseData.sensitive;
  }

  return res.json({ success: true, data: responseData });
};

export const createDriver = async (req, res) => {
  const body = req.body;

  try {
    let owner = null;
    if (req.user?.id && isUuid(req.user.id)) {
      owner = await prisma.owners.findFirst({ where: { user_id: req.user.id } });
    }
    if (!owner && req.user?.email) {
      const loggedInUser = await prisma.users.findUnique({ where: { email: req.user.email } });
      if (loggedInUser) {
        owner = await prisma.owners.findFirst({ where: { user_id: loggedInUser.id } });
      }
    }
    if (!owner) {
      owner = await prisma.owners.findFirst();
    }

    if (!owner) {
      const firstUser = await prisma.users.findFirst();
      if (firstUser) {
        owner = await prisma.owners.create({
          data: {
            user_id: firstUser.id,
            company_name: 'SmartFleet Logistics'
          }
        });
      }
    }

    const email = body.email || `driver.${Date.now()}@smartfleet.ai`;

    // Find or create associated user
    let user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.users.create({
        data: {
          name: body.name || 'New Driver',
          email,
          password_hash: '$2b$10$syntheticseedpasswordhash',
          role: 'DRIVER',
          status: 'active'
        }
      });
    } else {
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          name: body.name || user.name,
          role: 'DRIVER',
          status: 'active'
        }
      });
    }

    let licenseExpiryDate = null;
    if (body.licenseExpiry || body.licenseExpiryDate) {
      const parsed = new Date(body.licenseExpiry || body.licenseExpiryDate);
      if (!isNaN(parsed.getTime())) {
        licenseExpiryDate = parsed;
      }
    }

    let newDbDriver = await prisma.drivers.findUnique({ where: { user_id: user.id } });
    if (newDbDriver) {
      newDbDriver = await prisma.drivers.update({
        where: { id: newDbDriver.id },
        data: {
          owner_id: owner?.id || newDbDriver.owner_id,
          contact: body.phone || body.contact || newDbDriver.contact || '+91 98765 43210',
          license_number: body.licenseNumber || body.license_number || newDbDriver.license_number,
          license_expiry: licenseExpiryDate || newDbDriver.license_expiry,
          status: 'active'
        },
        include: {
          users: true,
          driver_vehicle: { include: { vehicles: true } }
        }
      });
    } else {
      newDbDriver = await prisma.drivers.create({
        data: {
          user_id: user.id,
          owner_id: owner?.id,
          contact: body.phone || body.contact || '+91 98765 43210',
          license_number: body.licenseNumber || body.license_number || `DL${Math.floor(10000000 + Math.random() * 90000000)}`,
          license_expiry: licenseExpiryDate,
          status: 'active'
        },
        include: {
          users: true,
          driver_vehicle: { include: { vehicles: true } }
        }
      });
    }

    if (body.assignedVehicleId && isUuid(body.assignedVehicleId)) {
      await prisma.driver_vehicle.deleteMany({
        where: { driver_id: newDbDriver.id }
      });
      await prisma.driver_vehicle.create({
        data: {
          driver_id: newDbDriver.id,
          vehicle_id: body.assignedVehicleId
        }
      });
      newDbDriver = await prisma.drivers.findUnique({
        where: { id: newDbDriver.id },
        include: {
          users: true,
          driver_vehicle: { include: { vehicles: true } }
        }
      });
    }

    const formatted = formatDriver(newDbDriver);
    DRIVERS.unshift(formatted);
    return res.status(201).json({ success: true, data: formatted });
  } catch (err) {
    console.warn('Prisma createDriver error, using memory fallback:', err.message);
  }

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

  try {
    if (isUuid(id)) {
      const dbStatus = status.toLowerCase() === 'active' ? 'active' : status.toLowerCase() === 'suspended' ? 'suspended' : 'inactive';
      const updated = await prisma.drivers.update({
        where: { id },
        data: { status: dbStatus },
        include: {
          users: true,
          driver_vehicle: { include: { vehicles: true } }
        }
      });
      const formatted = formatDriver(updated);
      DRIVERS = DRIVERS.map((d) => (d.id === id ? formatted : d));
      return res.json({ success: true, data: formatted });
    }
  } catch (err) {
    console.warn('Prisma updateDriverStatus error, using memory fallback:', err.message);
  }

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

export const deleteDriver = async (req, res) => {
  const { id } = req.params;
  try {
    if (isUuid(id)) {
      await prisma.drivers.delete({ where: { id } });
    }
    DRIVERS = DRIVERS.filter((d) => d.id !== id);
    return res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    console.warn('Prisma deleteDriver error, using memory fallback:', err.message);
    DRIVERS = DRIVERS.filter((d) => d.id !== id);
    return res.json({ success: true, message: 'Driver deleted' });
  }
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
