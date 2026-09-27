import { INITIAL_VEHICLES, DEMO_UTILISATION } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';
import prisma from '../repositories/store.js';
import { DRIVERS } from './driverController.js';

let VEHICLES = [...INITIAL_VEHICLES];

const formatVehicle = (v) => {
  const driverVehicle = v.driver_vehicle?.[0];
  const driverName = driverVehicle?.drivers?.users?.name;
  const driverId = driverVehicle?.driver_id;
  return {
    id: v.id,
    registration: v.registration_number,
    registrationNumber: v.registration_number,
    makeModel: `${v.brand || ''} ${v.model || ''}`.trim() || 'Heavy Fleet Truck',
    type: v.vehicle_type || 'Heavy Truck',
    status: v.status || 'available',
    speed: 0,
    heading: 0,
    lat: 12.9716,
    lng: 77.5946,
    fuelLevel: v.tank_capacity ? Math.min(100, Math.round(Number(v.tank_capacity) % 100)) : 80,
    odometer: v.estimated_mileage ? Math.round(Number(v.estimated_mileage) * 1000) : 124500,
    assignedDriverId: driverId || null,
    assignedDriverName: driverName || 'Unassigned',
    purchaseDate: v.purchase_date ? new Date(v.purchase_date).toISOString().split('T')[0] : '2023-01-15',
    insuranceExpiry: '2027-04-20',
    pucExpiry: '2026-12-15',
    lastGpsUpdate: v.updated_at ? new Date(v.updated_at).toISOString() : new Date().toISOString(),
    sensitive: {
      chassisNumber: `MAT${v.id.slice(0, 10).toUpperCase().replace(/-/g, '')}`,
      engineNumber: `ENG-${v.id.slice(0, 8).toUpperCase()}`,
      rcNumber: `${v.registration_number}RC`,
      insurancePolicyNo: `POL-SF-${v.id.slice(0, 6).toUpperCase()}`
    }
  };
};

export const getVehicles = async (req, res) => {
  const { page = 1, limit = 50, status, search } = req.query;

  try {
    const where = {};
    if (status && status !== 'all') {
      where.status = { equals: status, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { registration_number: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [dbVehicles, total] = await Promise.all([
      prisma.vehicles.findMany({
        where,
        take: parseInt(limit, 10),
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        orderBy: { created_at: 'desc' },
        include: {
          driver_vehicle: {
            take: 1,
            include: {
              drivers: {
                include: { users: true }
              }
            }
          }
        }
      }),
      prisma.vehicles.count({ where })
    ]);

    const formatted = (dbVehicles || []).map(formatVehicle);
    return res.json({
      success: true,
      data: formatted,
      meta: { page: parseInt(page, 10), limit: parseInt(limit, 10), total }
    });
  } catch (err) {
    console.warn('Prisma getVehicles error, using fallback:', err.message);
  }

  // Fallback to in-memory only if DB connection failed
  let filtered = [...VEHICLES];
  if (status && status !== 'all') {
    filtered = filtered.filter((v) => v.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (v) => v.registration.toLowerCase().includes(s) || v.makeModel.toLowerCase().includes(s)
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

export const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const v = await prisma.vehicles.findFirst({
      where: {
        OR: [
          { id: id },
          { registration_number: id }
        ]
      },
      include: {
        driver_vehicle: {
          take: 1,
          include: {
            drivers: {
              include: { users: true }
            }
          }
        }
      }
    });

    if (v) {
      const formatted = formatVehicle(v);
      const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
      if (!hasSecondaryAuth) {
        delete formatted.sensitive;
      }
      return res.json({ success: true, data: formatted });
    }
  } catch (err) {
    console.warn('Prisma getVehicleById error, using fallback:', err.message);
  }

  const vehicle = VEHICLES.find((v) => v.id === id || v.registration === id);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found` }
    });
  }

  const hasSecondaryAuth = Boolean(req.headers['x-secondary-auth']);
  const responseData = { ...vehicle };
  if (!hasSecondaryAuth) {
    delete responseData.sensitive;
  }

  return res.json({ success: true, data: responseData });
};

export const createVehicle = async (req, res) => {
  const body = req.body;
  const reg = (body.registrationNumber || body.registration || `KA-01-SF-${Math.floor(1000 + Math.random() * 9000)}`).trim();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const defaultExpiry = oneYearFromNow.toISOString().split('T')[0];

  try {
    let owner = await prisma.owners.findFirst();
    if (!owner) {
      const firstUser = await prisma.users.findFirst({ where: { role: 'OWNER' } }) || await prisma.users.findFirst();
      if (firstUser) {
        owner = await prisma.owners.create({
          data: {
            user_id: firstUser.id,
            company_name: 'SmartFleet Logistics'
          }
        });
      }
    }

    const newDbVehicle = await prisma.vehicles.create({
      data: {
        registration_number: reg,
        brand: body.brand || body.makeModel?.split(' ')[0] || 'Tata',
        model: body.model || body.makeModel?.split(' ').slice(1).join(' ') || 'Signa Truck',
        vehicle_type: body.type || 'Heavy Truck',
        status: body.status || 'available',
        owner_id: owner.id
      }
    });

    const formatted = formatVehicle(newDbVehicle);
    VEHICLES.unshift(formatted);
    return res.status(201).json({ success: true, data: formatted });
  } catch (err) {
    console.warn('Prisma createVehicle error, saving to memory:', err.message);
    const newV = {
      id: `veh-${Date.now()}`,
      registration: reg,
      registrationNumber: reg,
      makeModel: body.makeModel || 'Tata Truck',
      type: body.type || 'Heavy Truck',
      status: body.status || 'available',
      speed: 0,
      heading: 0,
      lat: 12.9716,
      lng: 77.5946,
      fuelLevel: 100,
      odometer: body.odometer || 1200,
      lastGpsUpdate: new Date().toISOString(),
      ...body
    };
    VEHICLES.unshift(newV);
    return res.status(201).json({ success: true, data: newV });
  }
};

export const updateVehicleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { registration_number: id };

    const updatedDb = await prisma.vehicles.update({
      where,
      data: { status }
    });
    if (updatedDb) {
      return res.json({ success: true, data: formatVehicle(updatedDb) });
    }
  } catch (err) {
    console.warn('Prisma updateVehicleStatus error:', err.message);
  }

  let updated = null;
  VEHICLES = VEHICLES.map((v) => {
    if (v.id === id || v.registration === id) {
      updated = { ...v, status };
      return updated;
    }
    return v;
  });

  return res.json({ success: true, data: updated || { id, status } });
};

export const toggleOutOfService = async (req, res) => {
  const { id } = req.params;
  try {
    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { registration_number: id };

    const current = await prisma.vehicles.findUnique({ where });
    if (current) {
      const nextStatus = current.status === 'out_of_service' ? 'available' : 'out_of_service';
      const updated = await prisma.vehicles.update({
        where,
        data: { status: nextStatus }
      });
      return res.json({ success: true, data: formatVehicle(updated) });
    }
  } catch (err) {
    console.warn('Prisma toggleOutOfService error:', err.message);
  }

  return updateVehicleStatus(req, res);
};

export const reassignVehicleDriver = async (req, res) => {
  const { id } = req.params;
  const { driverId, driverName } = req.body;

  let vehicle = VEHICLES.find((v) => v.id === id || v.registration === id);

  try {
    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { registration_number: id };
    const dbVeh = await prisma.vehicles.findUnique({
      where,
      include: {
        driver_vehicle: {
          include: {
            drivers: { include: { users: true } }
          }
        }
      }
    });

    if (dbVeh) {
      if (!vehicle) {
        vehicle = formatVehicle(dbVeh);
        VEHICLES.unshift(vehicle);
      }

      const isDriverUuid = typeof driverId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(driverId);
      if (isDriverUuid) {
        await prisma.driver_vehicle.deleteMany({ where: { vehicle_id: dbVeh.id } });
        await prisma.driver_vehicle.create({
          data: {
            vehicle_id: dbVeh.id,
            driver_id: driverId
          }
        });
      }
    }
  } catch (err) {
    console.warn('Prisma reassignVehicleDriver error:', err.message);
  }

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Vehicle ${id} not found` }
    });
  }

  // Safety check: Vehicle cannot be moving when changing drivers
  if (vehicle.status === 'moving' || vehicle.status === 'on_trip') {
    return res.status(400).json({
      success: false,
      error: { code: 'VEHICLE_MOVING', message: 'Driver cannot be reassigned while vehicle is moving' }
    });
  }

  const oldDriverId = vehicle.assignedDriverId;

  // Make old driver available
  if (oldDriverId) {
    const oldDriver = DRIVERS.find((d) => d.id === oldDriverId);
    if (oldDriver) {
      oldDriver.assignedVehicleId = null;
      oldDriver.assignedVehicleReg = null;
      oldDriver.status = 'Available';
    }
  }

  // Assign new driver to vehicle
  vehicle.assignedDriverId = driverId || null;
  vehicle.assignedDriverName = driverName || null;

  if (driverId) {
    const newDriver = DRIVERS.find((d) => d.id === driverId);
    if (newDriver) {
      newDriver.assignedVehicleId = vehicle.id;
      newDriver.assignedVehicleReg = vehicle.registration;
      newDriver.status = 'Active';
      vehicle.assignedDriverName = newDriver.name;
    }
  }

  return res.json({ success: true, data: vehicle });
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    const isUuid = typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where = isUuid ? { id } : { registration_number: id };
    await prisma.vehicles.delete({ where });
    return res.json({ success: true, data: { id, deleted: true } });
  } catch (err) {
    console.warn('Prisma deleteVehicle error:', err.message);
  }

  VEHICLES = VEHICLES.filter((v) => v.id !== id && v.registration !== id);
  return res.json({ success: true, data: { id, deleted: true } });
};

export const getUtilisationMetrics = async (req, res) => {
  try {
    const dbVehicles = await prisma.vehicles.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        driver_vehicle: {
          take: 1,
          include: { drivers: { include: { users: true } } }
        },
        trips: { take: 5 }
      }
    });

    if (dbVehicles && dbVehicles.length > 0) {
      const list = await Promise.all(
        dbVehicles.map(async (v, idx) => {
          const driverName = v.driver_vehicle?.[0]?.drivers?.users?.name || 'Fleet Driver';
          const tripsCount = v.trips?.length || (idx % 3 + 1);
          const activeHours = parseFloat(((tripsCount * 4.2) + 2).toFixed(1));
          const idleRatio = parseFloat((0.10 + (idx * 0.04)).toFixed(2));
          const baseItem = {
            id: v.id,
            vehicleReg: v.registration_number,
            score: Math.min(95, 70 + tripsCount * 6),
            activeHours,
            idleRatio,
            tripsPerDay: parseFloat((tripsCount / 2).toFixed(1)),
            recommendation: tripsCount > 2 ? 'Optimal' : 'Monitor',
            assignedDriverName: driverName
          };

          try {
            const mlScore = await mlServiceClient.getDriverUtilisation(v.id, {
              driver_id: v.driver_vehicle?.[0]?.driver_id || v.id,
              driver_name: driverName,
              trips_per_day: baseItem.tripsPerDay,
              active_hours: baseItem.activeHours * 240,
              idle_hours: baseItem.idleRatio * baseItem.activeHours * 240
            });
            return {
              ...baseItem,
              score: Math.round(mlScore.score || baseItem.score),
              recommendation: mlScore.recommendation || baseItem.recommendation,
              cluster: mlScore.cluster,
              isLiveModel: true
            };
          } catch {
            return baseItem;
          }
        })
      );
      return res.json({ success: true, data: list });
    }
  } catch (err) {
    console.warn('Prisma getUtilisationMetrics error, using fallback:', err.message);
  }

  return res.json({ success: true, data: DEMO_UTILISATION });
};

export { VEHICLES };

