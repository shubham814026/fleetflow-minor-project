import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'smartfleet_super_secret_jwt_key_2026';
export const SECONDARY_JWT_SECRET = process.env.SECONDARY_JWT_SECRET || 'smartfleet_secondary_vault_secret_key_2026';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const GPS_OFFLINE_THRESHOLD_MINS = parseInt(process.env.GPS_OFFLINE_THRESHOLD_MINS || '5', 10);
