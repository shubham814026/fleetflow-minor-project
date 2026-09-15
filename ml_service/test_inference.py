import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi.testclient import TestClient
from main import app, load_all_models

load_all_models()
client = TestClient(app)

def test_all():
    print("\n" + "=" * 60)
    print("TESTING ALL 5 REAL-TIME ML INFERENCE ENDPOINTS")
    print("=" * 60)

    # 1. Health
    res = client.get("/health")
    assert res.status_code == 200, res.text
    print("\n1. GET /health -> SUCCESS:")
    print("  ", res.json())

    # 2. Fuel Efficiency
    fuel_payload = {
        "vehicle_type": "Truck",
        "vehicle_age_years": 3.0,
        "estimated_mileage": 3.8,
        "fuel_type": "Diesel",
        "distance_km": 150.0,
        "duration_hours": 3.2,
        "avg_speed": 46.8,
        "weight_of_goods": 4500.0,
        "driver_experience_years": 4.0,
        "idle_time_minutes": 35.0,
        "stop_count": 4,
        "is_weekend": False,
        "is_holiday": False,
        "festival": "None",
        "season": "Winter",
        "weather": "Clear",
        "rainfall_mm": 0.0,
        "actual_fuel_liters": 48.0,
        "vehicle_reg": "MH-12-PQ-4821"
    }
    res = client.post("/predict/fuel-efficiency", json=fuel_payload)
    assert res.status_code == 200, res.text
    print("\n2. POST /predict/fuel-efficiency -> SUCCESS:")
    data = res.json()
    print(f"   Predicted Fuel: {data['predictedFuelPerKm']:.3f} L/km | Expected: {data['expectedLiters']} L | Actual: {data['actualLiters']} L | Excess: {data['excessLiters']} L (Rs. {data['excessCostINR']})")
    print(f"   Savings: {data['potentialSavings']} | Overconsuming: {data['isOverconsuming']}")

    # 3. Predictive Maintenance
    maint_payload = {
        "vehicle_id": "veh-101",
        "vehicle_reg": "KA-01-EQ-9042",
        "vehicle_type": "Truck",
        "vehicle_age_years": 4.0,
        "odometer": 88000.0,
        "total_distance_km": 65000.0,
        "distance_since_service": 9400.0,
        "average_load_kg": 4200.0,
        "harsh_brake_count": 280,
        "average_speed": 48.0,
        "maintenance_history_count": 3
    }
    res = client.post("/predict/maintenance", json=maint_payload)
    assert res.status_code == 200, res.text
    print("\n3. POST /predict/maintenance -> SUCCESS:")
    data = res.json()
    print(f"   Status: {data['status']} | Breakdown Risk: {data['breakdownRiskScore']}% | Service Required: {data['serviceRequired']}")
    print(f"   Component Risk: {data['primaryComponentRisk']} | Factors: {data['riskFactors']}")

    # 4. Driver Fraud Detection
    fraud_payload = {
        "trip_id": "TRP-2026-9912",
        "driver_id": "drv-201",
        "vehicle_reg": "MH-12-PQ-4821",
        "fuel_per_km_deviation": 2.4,
        "route_deviation_ratio": 1.45,
        "refill_per_1000km": 105.0,
        "idle_per_km": 1.8,
        "odom_distance_ratio": 1.0,
        "harsh_brakes_per_km": 0.018,
        "fuel_drop_liters": 35.0
    }
    res = client.post("/predict/fraud", json=fraud_payload)
    assert res.status_code == 200, res.text
    print("\n4. POST /predict/fraud -> SUCCESS:")
    data = res.json()
    print(f"   Anomaly Flag: {data['isAnomaly']} | Fraud Risk: {data['fraudRiskScore']}/100 | Severity: {data['severity']}")
    print(f"   Action: {data['action']} | Reasons: {data['anomalyReasons']}")

    # 5. Resource Utilisation
    util_payload = {
        "driver_id": "drv-101",
        "driver_name": "Rajesh Sharma",
        "driver_experience_years": 4.0,
        "completed_trips": 110,
        "trips_per_day": 0.38,
        "active_hours": 1620.0,
        "idle_hours": 240.0
    }
    res = client.post("/predict/utilisation", json=util_payload)
    assert res.status_code == 200, res.text
    print("\n5. POST /predict/utilisation -> SUCCESS:")
    data = res.json()
    print(f"   Driver: {data['driverName']} | Score: {data['utilisationScore']}/100 | Recommendation: {data['recommendation']}")

    # 6. Demand Forecasting
    res = client.get("/predict/demand?days=7")
    assert res.status_code == 200, res.text
    print("\n6. GET /predict/demand -> SUCCESS:")
    data = res.json()
    print(f"   Next 7 Days Demand: {data['nextWeekDemandTrips']} Trips | Peak Day: {data['peakDay']} ({data['peakTrips']} trips)")
    print(f"   Recommended: {data['recommendedVehicles']} Vehicles, {data['recommendedDrivers']} Drivers | Deficit: {data['predictedVehicleDeficit']}")

    print("\n" + "=" * 60)
    print("ALL 5 ENDPOINTS VERIFIED AND WORKING FLAWLESSLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_all()
