import { mlServiceClient } from '../services/mlServiceClient.js';

let MAINTENANCE_RECORDS = [
  { id: 'm-1', vehicleReg: 'KA-01-EQ-9042', serviceType: 'Engine Oil & Filter', lastServiceDate: '2026-05-10', nextServiceDate: '2026-09-10', odometer: 142500, status: 'Due Soon' },
  { id: 'm-2', vehicleReg: 'MH-12-PQ-4821', serviceType: 'Tire Alignment & Rotation', lastServiceDate: '2026-02-15', nextServiceDate: '2026-08-15', odometer: 89400, status: 'Overdue' },
  { id: 'm-3', vehicleReg: 'DL-01-AB-1234', serviceType: 'Brake Pad Replacement', lastServiceDate: '2026-07-01', nextServiceDate: '2026-11-01', odometer: 64200, status: 'Due' }
];

export const getMaintenanceRecords = async (req, res) => {
  try {
    const enriched = await Promise.all(
      MAINTENANCE_RECORDS.map(async (rec) => {
        try {
          const isOverdue = rec.status.toLowerCase().includes('overdue');
          const isDue = rec.status.toLowerCase().includes('due');
          const odo = rec.odometer || (isOverdue ? 250000.0 : isDue ? 160000.0 : 65000.0);
          const mlPred = await mlServiceClient.getMaintenancePrediction(rec.id, {
            vehicle_id: rec.id,
            vehicle_reg: rec.vehicleReg,
            vehicle_type: 'Truck',
            vehicle_age_years: isOverdue ? 4.5 : isDue ? 3.0 : 1.5,
            odometer: odo,
            total_distance_km: odo * 0.85,
            distance_since_service: isOverdue ? 9800.0 : isDue ? 7800.0 : 2500.0,
            average_load_kg: isOverdue ? 14000.0 : isDue ? 9500.0 : 4500.0,
            harsh_brake_count: isOverdue ? 550 : isDue ? 240 : 50,
            average_speed: 48.0,
            maintenance_history_count: isOverdue ? 4 : isDue ? 2 : 1
          });

          return {
            ...rec,
            status: mlPred.status || rec.status,
            breakdownRiskScore: mlPred.breakdownRiskScore,
            primaryComponentRisk: mlPred.componentRisk,
            riskFactors: mlPred.riskFactors,
            confidence: mlPred.confidence,
            serviceRequired: mlPred.serviceRequired,
            predictedServiceDue: mlPred.predictedServiceDue,
            isLiveModel: true
          };
        } catch {
          return rec;
        }
      })
    );
    return res.json({ success: true, data: enriched });
  } catch {
    return res.json({ success: true, data: MAINTENANCE_RECORDS });
  }
};

export const createMaintenanceRecord = async (req, res) => {
  const body = req.body;
  const newM = { id: `m-${Date.now()}`, ...body };
  MAINTENANCE_RECORDS.unshift(newM);
  return res.status(201).json({ success: true, data: newM });
};
