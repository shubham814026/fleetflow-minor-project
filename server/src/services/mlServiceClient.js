/**
 * Integration Boundary for Future ML Service (e.g. Python FastAPI Microservice)
 * Currently returns stored DB insights or standard deterministic fallbacks.
 */
class MLServiceClient {
  async getFuelInsights() {
    return [
      {
        id: 'ins-1',
        title: 'High Engine Idle Detected',
        vehicle: 'MH-12-PQ-4821',
        description: 'Vehicle spent 45 mins idle during transit. Estimated 3.8L excess fuel wasted.',
        potentialSavings: '₹ 14,200 / month'
      },
      {
        id: 'ins-2',
        title: 'Fuel Mileage Below Fleet Average',
        vehicle: 'TN-09-CD-5678',
        description: 'Delivering 2.9 km/L vs fleet average 3.85 km/L. Tire pressure or fuel injector service recommended.',
        potentialSavings: '₹ 22,500 / month'
      }
    ];
  }

  async getDemandForecast() {
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
      ]
    };
  }

  async getFraudInsights() {
    return [
      {
        id: 'frd-101',
        vehicleReg: 'MH-12-PQ-4821',
        riskScore: 0.88,
        reason: 'Sudden fuel level drop of 35L while ignition on and zero speed',
        metadata: { dropL: 35, timeSpanMins: 5 }
      }
    ];
  }

  async getMaintenancePrediction(vehicleId) {
    return {
      predictedServiceDue: '2026-09-15',
      confidence: 0.92,
      componentRisk: 'Brake Fluid & Pad Wear'
    };
  }
}

export const mlServiceClient = new MLServiceClient();
export default mlServiceClient;
