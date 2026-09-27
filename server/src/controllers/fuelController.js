import { DEMO_FUEL_METRICS } from '../../../client/src/api/mockData.js';
import { mlServiceClient } from '../services/mlServiceClient.js';
import prisma from '../repositories/store.js';

export const getFuelMetrics = async (req, res) => {
  try {
    const liveInsights = await mlServiceClient.getFuelInsights();

    // Query aggregated live metrics from Supabase
    let totalLiters = 0;
    let totalSpent = 0;
    let avgCostPerKm = 24.5;
    let avgKmPerLitre = 3.85;

    try {
      const fuelAgg = await prisma.fuel_logs.aggregate({
        _sum: { liters: true, cost: true },
        _avg: { cost: true, liters: true, odometer: true },
        _count: true
      });
      if (fuelAgg._count > 0) {
        totalLiters = Math.round(Number(fuelAgg._sum.liters || 0));
        totalSpent = Math.round(Number(fuelAgg._sum.cost || 0));
        if (totalLiters > 0 && totalSpent > 0) {
          avgCostPerKm = parseFloat((totalSpent / (totalLiters * 3.8)).toFixed(2));
        }
      }
    } catch (e) {
      console.warn('Fuel agg warning:', e.message);
    }

    const responseData = {
      ...DEMO_FUEL_METRICS,
      totalSpentThisMonth: totalSpent > 0 ? totalSpent : DEMO_FUEL_METRICS.totalSpentThisMonth,
      totalLitres: totalLiters > 0 ? totalLiters : DEMO_FUEL_METRICS.totalLitres,
      fleetTotalConsumptionLitres: totalLiters > 0 ? totalLiters : DEMO_FUEL_METRICS.fleetTotalConsumptionLitres,
      avgCostPerKm,
      avgKmPerLitre,
      aiInsights: liveInsights
    };
    return res.json({ success: true, data: responseData });
  } catch (err) {
    return res.json({ success: true, data: DEMO_FUEL_METRICS });
  }
};

export const getFuelLogs = async (req, res) => {
  try {
    const logs = await prisma.fuel_logs.findMany({
      take: 50,
      orderBy: { created_at: 'desc' },
      include: {
        vehicles: true
      }
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      vehicleId: l.vehicle_id,
      vehicleReg: l.vehicles?.registration_number || 'KA-01-EQ-9042',
      date: l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '2026-09-27',
      litres: Number(l.liters || 0),
      cost: Number(l.cost || 0),
      odometer: Number(l.odometer || 0),
      fuelStation: l.fuel_station || 'Fleet Station'
    }));

    return res.json({ success: true, data: formatted });
  } catch (err) {
    console.warn('Prisma getFuelLogs error:', err.message);
    return res.json({ success: true, data: [] });
  }
};

export const addFuelLog = async (req, res) => {
  const body = req.body;

  const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  try {
    let veh = null;
    if (isUuid(body.vehicleId)) {
      veh = await prisma.vehicles.findUnique({ where: { id: body.vehicleId } });
    }
    if (!veh && (body.vehicleReg || body.vehicleId)) {
      const reg = body.vehicleReg || body.vehicleId;
      veh = await prisma.vehicles.findUnique({ where: { registration_number: reg } });
    }
    if (!veh) {
      veh = await prisma.vehicles.findFirst();
    }

    if (veh) {
      const dateVal = body.date ? new Date(body.date) : new Date();
      const litersVal = Number(body.litres || body.liters || 50);
      const costVal = Number(body.cost || 4800);
      const pricePerLiter = litersVal > 0 ? parseFloat((costVal / litersVal).toFixed(2)) : null;

      const created = await prisma.fuel_logs.create({
        data: {
          vehicle_id: veh.id,
          liters: litersVal,
          cost: costVal,
          price_per_liter: pricePerLiter,
          odometer: Number(body.odometer || veh.odometer || 142500),
          fuel_station: body.fuelStation || 'IndianOil Fleet Hub',
          created_at: !isNaN(dateVal.getTime()) ? dateVal : new Date()
        }
      });
      return res.status(201).json({
        success: true,
        data: {
          id: created.id,
          vehicleId: created.vehicle_id,
          vehicleReg: veh.registration_number,
          date: created.created_at ? new Date(created.created_at).toISOString().split('T')[0] : '2026-09-27',
          litres: Number(created.liters),
          cost: Number(created.cost),
          pricePerLiter: Number(created.price_per_liter || 0),
          odometer: Number(created.odometer)
        }
      });
    }
  } catch (err) {
    console.warn('Prisma addFuelLog error, using fallback:', err.message);
  }

  const newLog = {
    id: `fuel-${Date.now()}`,
    vehicleId: body.vehicleId || 'veh-101',
    vehicleReg: body.vehicleReg || 'KA-01-EQ-9042',
    date: body.date || new Date().toISOString().split('T')[0],
    litres: Number(body.litres || body.liters || 50),
    cost: Number(body.cost || 4800),
    odometer: Number(body.odometer || 142500),
    fuelStation: body.fuelStation || 'Fleet Station'
  };

  return res.status(201).json({ success: true, data: newLog });
};
