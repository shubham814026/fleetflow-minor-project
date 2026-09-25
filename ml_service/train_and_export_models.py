"""
SmartFleet AI - Model Generator and Trainer
Generates and serializes the 5 production ML model bundles expected by ml_service/main.py
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.tree import DecisionTreeClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

print(f"Target Models Directory: {MODELS_DIR}")

# ---------------------------------------------------------------------------
# 1. Model 7.1: Fuel Efficiency (Random Forest Pipeline)
# ---------------------------------------------------------------------------
print("Generating Model 7.1: Fuel Efficiency Pipeline...")
cat_cols = ["vehicle_type", "fuel_type", "festival", "season", "weather"]
num_cols = [
    "vehicle_age_years", "estimated_mileage", "distance_km", "duration_hours",
    "avg_speed", "weight_of_goods", "driver_experience_years",
    "idle_time_minutes", "stop_count", "is_weekend", "is_holiday", "rainfall_mm"
]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", StandardScaler(), num_cols)
    ]
)

rf_reg = RandomForestRegressor(n_estimators=25, random_state=42)
fuel_pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("regressor", rf_reg)])

# Train on diverse synthetic dataset matching domain
np.random.seed(42)
n_samples = 400
synthetic_df = pd.DataFrame({
    "vehicle_type": np.random.choice(["Truck", "Van", "Trailer", "Heavy Hauler"], n_samples),
    "vehicle_age_years": np.random.uniform(0.5, 10.0, n_samples),
    "estimated_mileage": np.random.uniform(2.5, 6.5, n_samples),
    "fuel_type": np.random.choice(["Diesel", "CNG", "Electric"], n_samples),
    "distance_km": np.random.uniform(10.0, 500.0, n_samples),
    "duration_hours": np.random.uniform(0.5, 12.0, n_samples),
    "avg_speed": np.random.uniform(20.0, 80.0, n_samples),
    "weight_of_goods": np.random.uniform(500.0, 20000.0, n_samples),
    "driver_experience_years": np.random.uniform(1.0, 20.0, n_samples),
    "idle_time_minutes": np.random.uniform(5.0, 120.0, n_samples),
    "stop_count": np.random.randint(0, 10, n_samples),
    "is_weekend": np.random.choice([True, False], n_samples),
    "is_holiday": np.random.choice([True, False], n_samples),
    "festival": np.random.choice(["None", "Diwali", "Holi", "Eid"], n_samples),
    "season": np.random.choice(["Winter", "Monsoon", "Summer"], n_samples),
    "weather": np.random.choice(["Clear", "Rain", "Fog", "Thunderstorm"], n_samples),
    "rainfall_mm": np.random.uniform(0.0, 50.0, n_samples)
})

# Typical consumption formula ~ 0.28 L/km baseline + weight penalty + speed inefficiency
target_fuel_per_km = (
    0.28
    + (synthetic_df["weight_of_goods"] / 40000.0)
    + (synthetic_df["idle_time_minutes"] / 1000.0)
    + np.where(synthetic_df["avg_speed"] < 30, 0.06, 0.0)
    + np.random.normal(0, 0.015, n_samples)
)
target_fuel_per_km = np.clip(target_fuel_per_km, 0.15, 0.65)

fuel_pipeline.fit(synthetic_df, target_fuel_per_km)
fuel_save_path = os.path.join(MODELS_DIR, "fuel_efficiency_rf.joblib")
joblib.dump(fuel_pipeline, fuel_save_path)
print(f"  [+] Saved {fuel_save_path}")

# ---------------------------------------------------------------------------
# 2. Model 7.2: Resource Utilisation (K-Means & Scalers)
# ---------------------------------------------------------------------------
print("Generating Model 7.2: Resource Utilisation Bundle...")
raw_util_data = np.array([
    [0.15, 450.0, 0.45],  # Low
    [0.22, 900.0, 0.32],  # Monitor
    [0.35, 1550.0, 0.18], # Optimal
    [0.42, 1950.0, 0.12], # High
    [0.10, 300.0, 0.55],
    [0.38, 1700.0, 0.15],
    [0.28, 1200.0, 0.25],
    [0.45, 2100.0, 0.09]
])

minmax_scaler = MinMaxScaler(feature_range=(0, 1))
minmax_scaler.fit(np.array([[0.05, 100.0, 0.05], [0.60, 2400.0, 0.60]]))

std_scaler = StandardScaler()
scaled_util = std_scaler.fit_transform(raw_util_data)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans.fit(scaled_util)

util_bundle = {
    "kmeans": kmeans,
    "scaler": std_scaler,
    "minmax_scaler": minmax_scaler
}
util_save_path = os.path.join(MODELS_DIR, "resource_utilisation_kmeans.joblib")
joblib.dump(util_bundle, util_save_path)
print(f"  [+] Saved {util_save_path}")

# ---------------------------------------------------------------------------
# 3. Model 7.3: Fraud & Anomaly Detection (Isolation Forest)
# ---------------------------------------------------------------------------
print("Generating Model 7.3: Fraud Detection Bundle...")
feature_names = [
    "fuel_per_km_deviation", "route_deviation_ratio", "refill_per_1000km",
    "idle_per_km", "odom_distance_ratio", "harsh_brakes_per_km"
]

# Normal driving data
normal_telemetry = np.random.multivariate_normal(
    mean=[0.05, 1.02, 25.0, 0.15, 1.0, 0.005],
    cov=np.diag([0.02, 0.01, 15.0, 0.01, 0.001, 0.0001]),
    size=300
)

# A few anomalous fraud cases
anomalies = np.array([
    [2.8, 1.6, 95.0, 1.8, 1.0, 0.02],
    [3.1, 1.8, 120.0, 2.2, 1.1, 0.03],
    [1.9, 1.5, 80.0, 1.2, 1.0, 0.018]
])

fraud_training_data = np.vstack([normal_telemetry, anomalies])

scaler_fraud = StandardScaler()
scaled_fraud = scaler_fraud.fit_transform(fraud_training_data)

iso_forest = IsolationForest(n_estimators=60, contamination=0.08, random_state=42)
iso_forest.fit(scaled_fraud)

fraud_bundle = {
    "isolation_forest": iso_forest,
    "scaler": scaler_fraud,
    "feature_names": feature_names
}
fraud_save_path = os.path.join(MODELS_DIR, "fraud_detection_isoforest.joblib")
joblib.dump(fraud_bundle, fraud_save_path)
print(f"  [+] Saved {fraud_save_path}")

# ---------------------------------------------------------------------------
# 4. Model 7.4: Fleet Demand Forecasting (Holt-Winters)
# ---------------------------------------------------------------------------
print("Generating Model 7.4: Demand Forecasting Model...")
# 60 days of realistic historical daily demand numbers
time_series = [
    145, 152, 160, 158, 172, 168, 140,
    148, 155, 162, 165, 178, 170, 142,
    150, 158, 166, 169, 185, 175, 148,
    155, 162, 170, 174, 192, 180, 150,
    160, 168, 175, 180, 198, 185, 155,
    162, 170, 182, 186, 205, 192, 160,
    165, 174, 185, 189, 210, 195, 165,
    170, 178, 188, 194, 215, 200, 170,
    175, 185, 192, 198
]

hw_model = ExponentialSmoothing(
    time_series,
    seasonal_periods=7,
    trend="add",
    seasonal="add"
).fit()

demand_bundle = {
    "holt_winters_model": hw_model,
    "operational_metrics": {
        "trips_per_vehicle": 6.0,
        "trips_per_driver": 5.0,
        "baseline_vehicles": 218,
        "baseline_drivers": 261
    }
}
demand_save_path = os.path.join(MODELS_DIR, "demand_forecasting_enhanced_models.joblib")
joblib.dump(demand_bundle, demand_save_path)
print(f"  [+] Saved {demand_save_path}")

# ---------------------------------------------------------------------------
# 5. Model 7.5: Predictive Maintenance (Random Forest & Decision Tree)
# ---------------------------------------------------------------------------
print("Generating Model 7.5: Predictive Maintenance Models...")
enriched_cols = [
    "vehicle_type_encoded", "vehicle_age_years", "odometer", "total_distance_km",
    "distance_since_service", "average_load_kg", "harsh_brake_count", "average_speed",
    "maintenance_history_count", "annual_distance_km", "service_gap_ratio",
    "brake_intensity_per_1000km", "mechanical_stress_index", "maintenance_rate_per_year"
]

le = LabelEncoder()
le.fit(["Truck", "Van", "Trailer", "Heavy Hauler", "Light Truck"])

# Generate synthetic fleet maintenance samples
n_maint = 350
v_enc = np.random.randint(0, 4, n_maint)
age = np.random.uniform(0.5, 8.0, n_maint)
odo = np.random.uniform(15000.0, 250000.0, n_maint)
total_dist = odo * np.random.uniform(0.7, 0.95, n_maint)
dist_since_service = np.random.uniform(500.0, 14000.0, n_maint)
avg_load = np.random.uniform(2000.0, 15000.0, n_maint)
harsh_brakes = np.random.randint(20, 600, n_maint)
avg_speed = np.random.uniform(30.0, 75.0, n_maint)
hist_count = np.random.randint(1, 8, n_maint)

annual_dist = total_dist / age
service_gap = dist_since_service / odo
brake_intensity = (harsh_brakes / total_dist) * 1000.0
mech_stress = (harsh_brakes * avg_load) / 1000.0
maint_rate = hist_count / age

X_maint_df = pd.DataFrame({
    "vehicle_type_encoded": v_enc,
    "vehicle_age_years": age,
    "odometer": odo,
    "total_distance_km": total_dist,
    "distance_since_service": dist_since_service,
    "average_load_kg": avg_load,
    "harsh_brake_count": harsh_brakes,
    "average_speed": avg_speed,
    "maintenance_history_count": hist_count,
    "annual_distance_km": annual_dist,
    "service_gap_ratio": service_gap,
    "brake_intensity_per_1000km": brake_intensity,
    "mechanical_stress_index": mech_stress,
    "maintenance_rate_per_year": maint_rate
})

# Service required if distance since service > 8000 or brake intensity is high
y_service_required = (
    (dist_since_service > 8000)
    | (brake_intensity > 2.5)
    | (age > 6.0)
).astype(int)

scaler_fe = StandardScaler()
X_maint_scaled = scaler_fe.fit_transform(X_maint_df[enriched_cols].values)

rf_maint = RandomForestClassifier(n_estimators=30, max_depth=6, random_state=42)
rf_maint.fit(X_maint_scaled, y_service_required)

dt_maint = DecisionTreeClassifier(max_depth=5, random_state=42)
dt_maint.fit(X_maint_scaled, y_service_required)

maint_bundle = {
    "decision_tree_final": dt_maint,
    "random_forest": rf_maint,
    "scaler_fe": scaler_fe,
    "label_encoder": le,
    "enriched_feature_cols": enriched_cols
}
maint_save_path = os.path.join(MODELS_DIR, "predictive_maintenance_models.joblib")
joblib.dump(maint_bundle, maint_save_path)
print(f"  [+] Saved {maint_save_path}")

print("=" * 60)
print("ALL 5 SMARTFLEET AI PRODUCTION MODELS GENERATED SUCCESSFULLY!")
print("=" * 60)
