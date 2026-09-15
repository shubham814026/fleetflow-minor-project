import { ML_SERVICE_URL } from '../config/env.js';

/**
 * SmartFleet AI Real-Time ML Service Client
 * Connects Node.js Express backend to Python FastAPI Inference Microservice (Port 8000).
 * Pre-loads 5 ML models and falls back seamlessly if microservice is offline.
 */
class MLServiceClient {
  constructor() {
    this.baseUrl = ML_SERVICE_URL;
  }

  /**
   * Helper to perform HTTP fetch with timeout and graceful error handling
   */
  async _fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Model 7.1: Real-Time Fuel Efficiency & Over-Consumption Residual Audit
   */
  async getFuelInsights(customPayload = null) {
    const defaultPayload = {
      vehicle_type: 'Truck',
      vehicle_age_years: 3.0,
      estimated_mileage: 3.8,
      fuel_type: 'Diesel',
      distance_km: 140.0,
      duration_hours: 3.0,
      avg_speed: 46.5,
      weight_of_goods: 4200.0,
      driver_experience_years: 4.0,
      idle_time_minutes: 42.0,
      stop_count: 4,
      is_weekend: false,
      is_holiday: false,
      festival: 'None',
      season: 'Winter',
      weather: 'Clear',
      rainfall_mm: 0.0,
      actual_fuel_liters: 46.0,
      vehicle_reg: 'MH-12-PQ-4821'
    };

    const payload = customPayload || defaultPayload;

    try {
      const result = await this._fetchWithTimeout(`${this.baseUrl}/predict/fuel-efficiency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return [
        {
          id: `ins-live-${Date.now()}`,
          title: result.isOverconsuming ? 'High Fuel Over-Consumption Detected' : 'Fuel Performance Optimal',
          vehicle: result.vehicleReg || 'MH-12-PQ-4821',
          description: result.insights?.join(' ') || `Delivering ${result.predictedFuelPerKm} L/km. Expected ${result.expectedLiters}L, consumed ${result.actualLiters}L.`,
          potentialSavings: result.potentialSavings || '₹ 14,200 / month',
          predictedFuelPerKm: result.predictedFuelPerKm,
          excessLiters: result.excessLiters,
          excessCostINR: result.excessCostINR,
          isLiveModel: true
        },
        {
          id: 'ins-2',
          title: 'Fuel Mileage Below Fleet Average',
          vehicle: 'TN-09-CD-5678',
          description: 'Delivering 2.9 km/L vs fleet average 3.85 km/L. Tire pressure or fuel injector service recommended.',
          potentialSavings: '₹ 22,500 / month',
          isLiveModel: false
        }
      ];
    } catch (err) {
      console.warn(`[MLServiceClient] FastAPI fuel-efficiency call fallback (${err.message}). Using baseline.`);
      return [
        {
          id: 'ins-1',
          title: 'High Engine Idle Detected',
          vehicle: 'MH-12-PQ-4821',
          description: 'Vehicle spent 45 mins idle during transit. Estimated 3.8L excess fuel wasted.',
          potentialSavings: '₹ 14,200 / month',
          isLiveModel: false
        },
        {
          id: 'ins-2',
          title: 'Fuel Mileage Below Fleet Average',
          vehicle: 'TN-09-CD-5678',
          description: 'Delivering 2.9 km/L vs fleet average 3.85 km/L. Tire pressure or fuel injector service recommended.',
          potentialSavings: '₹ 22,500 / month',
          isLiveModel: false
        }
      ];
    }
  }

  /**
   * Model 7.4: Dynamic Fleet Demand & Capacity Deficit Forecasting
   */
  async getDemandForecast(days = 7) {
    try {
      const result = await this._fetchWithTimeout(`${this.baseUrl}/predict/demand?days=${days}`);
      return {
        nextWeekDemandTrips: result.nextWeekDemandTrips || 184,
        peakDay: result.peakDay || 'Friday',
        peakTrips: result.peakTrips || 210,
        predictedVehicleDeficit: result.predictedVehicleDeficit ?? 3,
        recommendedVehicles: result.recommendedVehicles || 35,
        recommendedDrivers: result.recommendedDrivers || 42,
        capacity: 200,
        capacityGap: -16,
        demandByRegion: result.demandByRegion || [
          { region: 'Bengaluru ICD', trips: 64, trend: '+12%' },
          { region: 'Mumbai JNPT', trips: 78, trend: '+18%' },
          { region: 'Delhi NCR', trips: 42, trend: '+5%' }
        ],
        dailyForecast: result.dailyForecast || [],
        isLiveModel: true
      };
    } catch (err) {
      console.warn(`[MLServiceClient] FastAPI demand forecasting fallback (${err.message}). Using baseline.`);
      return {
        nextWeekDemandTrips: 184,
        peakDay: 'Friday',
        predictedVehicleDeficit: 3,
        capacity: 200,
        capacityGap: -16,
        recommendedDrivers: 8,
        recommendedVehicles: 7,
        demandByRegion: [
          { region: 'Bengaluru ICD', trips: 64, trend: '+12%' },
          { region: 'Mumbai JNPT', trips: 78, trend: '+18%' },
          { region: 'Delhi NCR', trips: 42, trend: '+5%' }
        ],
        isLiveModel: false
      };
    }
  }

  /**
   * Model 7.3: Real-Time Driver Fraud & Fuel Theft Isolation Forest
   */
  async getFraudInsights(customPayload = null) {
    const defaultPayload = {
      trip_id: 'TRP-2026-001',
      driver_id: 'drv-201',
      vehicle_reg: 'MH-12-PQ-4821',
      fuel_per_km_deviation: 2.2,
      route_deviation_ratio: 1.38,
      refill_per_1000km: 98.0,
      idle_per_km: 1.6,
      odom_distance_ratio: 1.0,
      harsh_brakes_per_km: 0.015,
      fuel_drop_liters: 32.0
    };

    const payload = customPayload || defaultPayload;

    try {
      const result = await this._fetchWithTimeout(`${this.baseUrl}/predict/fraud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return [
        {
          id: `frd-${Date.now()}`,
          vehicleReg: result.vehicleReg || 'MH-12-PQ-4821',
          riskScore: result.fraudRiskScore / 100.0,
          rawRiskScore: result.fraudRiskScore,
          severity: result.severity,
          reason: result.anomalyReasons?.join(' • ') || 'Unusual telemetry deviation detected by Isolation Forest',
          action: result.action,
          isAnomaly: result.isAnomaly,
          metadata: { dropL: payload.fuel_drop_liters || 32, timeSpanMins: 5 },
          isLiveModel: true
        }
      ];
    } catch (err) {
      console.warn(`[MLServiceClient] FastAPI fraud detection fallback (${err.message}). Using baseline.`);
      return [
        {
          id: 'frd-101',
          vehicleReg: 'MH-12-PQ-4821',
          riskScore: 0.88,
          reason: 'Sudden fuel level drop of 35L while ignition on and zero speed',
          metadata: { dropL: 35, timeSpanMins: 5 },
          isLiveModel: false
        }
      ];
    }
  }

  /**
   * Model 7.5: Real-Time Predictive Maintenance Health Check
   */
  async getMaintenancePrediction(vehicleId, customPayload = null) {
    const defaultPayload = {
      vehicle_id: vehicleId || 'veh-101',
      vehicle_reg: 'KA-01-EQ-9042',
      vehicle_type: 'Truck',
      vehicle_age_years: 4.0,
      odometer: 89400.0,
      total_distance_km: 68000.0,
      distance_since_service: 9500.0,
      average_load_kg: 4400.0,
      harsh_brake_count: 240,
      average_speed: 48.0,
      maintenance_history_count: 3
    };

    const payload = customPayload || defaultPayload;

    try {
      const result = await this._fetchWithTimeout(`${this.baseUrl}/predict/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const today = new Date();
      const targetDate = new Date(today.setDate(today.getDate() + (result.predictedServiceDueDays || 14)))
        .toISOString()
        .split('T')[0];

      return {
        vehicleReg: result.vehicleReg || 'KA-01-EQ-9042',
        status: result.status || 'Due Soon',
        serviceRequired: result.serviceRequired,
        breakdownRiskScore: result.breakdownRiskScore,
        confidence: result.confidence || 0.92,
        componentRisk: result.primaryComponentRisk || 'Brake Pad & Rotor Wear',
        riskFactors: result.riskFactors || [],
        predictedServiceDue: targetDate,
        isLiveModel: true
      };
    } catch (err) {
      console.warn(`[MLServiceClient] FastAPI predictive maintenance fallback (${err.message}). Using baseline.`);
      return {
        predictedServiceDue: '2026-09-25',
        status: 'Due Soon',
        confidence: 0.92,
        componentRisk: 'Brake Fluid & Pad Wear',
        isLiveModel: false
      };
    }
  }

  /**
   * Model 7.2: Real-Time Driver Utilisation & Reassignment Scoring
   */
  async getDriverUtilisation(driverId, customPayload = null) {
    const defaultPayload = {
      driver_id: driverId || 'drv-101',
      driver_name: 'Rajesh Sharma',
      driver_experience_years: 4.0,
      completed_trips: 115,
      trips_per_day: 0.36,
      active_hours: 1580.0,
      idle_hours: 260.0
    };

    const payload = customPayload || defaultPayload;

    try {
      const result = await this._fetchWithTimeout(`${this.baseUrl}/predict/utilisation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return {
        driverId: result.driverId,
        driverName: result.driverName,
        score: result.utilisationScore,
        activeHours: result.activeHours,
        idleRatio: result.idleRatio,
        tripsPerDay: result.tripsPerDay,
        recommendation: result.recommendation,
        cluster: result.cluster,
        isLiveModel: true
      };
    } catch (err) {
      console.warn(`[MLServiceClient] FastAPI utilisation fallback (${err.message}). Using baseline.`);
      return {
        driverId: driverId || 'drv-101',
        score: 78.4,
        activeHours: 1580.0,
        idleRatio: 0.14,
        tripsPerDay: 0.36,
        recommendation: 'Optimal',
        isLiveModel: false
      };
    }
  }
}

export const mlServiceClient = new MLServiceClient();
export default mlServiceClient;
