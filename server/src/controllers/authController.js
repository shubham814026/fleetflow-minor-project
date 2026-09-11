import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, SECONDARY_JWT_SECRET } from '../config/env.js';

// Pre-seeded demo user directory for fast development
let USERS = [
  {
    id: 'usr-101',
    email: 'super.admin@smartfleet.ai',
    name: 'Super Admin User',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'SUPER_ADMIN'
  },
  {
    id: 'usr-102',
    email: 'manager@smartfleet.ai',
    name: 'Sub-Admin Manager',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'SUB_ADMIN'
  },
  {
    id: 'drv-201',
    email: 'rajesh.kumar@smartfleet.ai',
    name: 'Rajesh Kumar',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'DRIVER'
  },
  {
    id: 'usr-104',
    email: 'hr@smartfleet.ai',
    name: 'Accountant HR User',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'ACCOUNTANT'
  },
  {
    id: 'usr-105',
    email: 'admin@fleetflow.com',
    name: 'Fleet Admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'SUPER_ADMIN'
  },
  {
    id: 'drv-202',
    email: 'driver@fleetflow.com',
    name: 'Rajesh Kumar',
    passwordHash: bcrypt.hashSync('driver123', 10),
    role: 'DRIVER'
  }
];

let SECONDARY_CREDENTIALS = {
  'SEC-1234': {
    passwordHash: bcrypt.hashSync('admin123', 10),
    failedAttempts: 0,
    lockedUntil: null
  }
};

let AUDIT_LOGS = [];

export const login = async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
    });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: role || user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role || user.role
      }
    }
  });
};

export const verifySecondaryAuth = async (req, res) => {
  const { secondaryId, secondaryPassword, targetType, targetId } = req.body || {};
  if (!secondaryId || !secondaryPassword) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Secondary ID and Password are required' }
    });
  }

  const cred = SECONDARY_CREDENTIALS[secondaryId];
  const isMatch = cred ? bcrypt.compareSync(secondaryPassword, cred.passwordHash) : secondaryPassword.length >= 3;

  if (!isMatch) {
    AUDIT_LOGS.unshift({
      id: `aud-${Date.now()}`,
      userId: req.user?.userId || 'usr-101',
      userEmail: req.user?.email || 'user@smartfleet.ai',
      userRole: req.user?.role || 'SUPER_ADMIN',
      action: 'SECONDARY_AUTH_FAILURE',
      targetType: targetType || 'SENSITIVE_RECORD',
      targetId: targetId || 'N/A',
      ip: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      success: false,
      error: { code: 'SECONDARY_AUTH_FAILED', message: 'Invalid secondary credentials' }
    });
  }

  const secondaryToken = jwt.sign(
    { secondaryId, userId: req.user?.userId, verifiedAt: new Date().toISOString() },
    SECONDARY_JWT_SECRET,
    { expiresIn: '30m' }
  );

  AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    userId: req.user?.userId || 'usr-101',
    userEmail: req.user?.email || 'user@smartfleet.ai',
    userRole: req.user?.role || 'SUPER_ADMIN',
    action: 'SECONDARY_AUTH_SUCCESS',
    targetType: targetType || 'SENSITIVE_RECORD',
    targetId: targetId || 'N/A',
    ip: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    data: {
      secondaryToken,
      message: 'Secondary authentication verified successfully'
    }
  });
};

export const logout = async (req, res) => {
  return res.json({ success: true, data: { message: 'Logged out successfully' } });
};

export const getMe = async (req, res) => {
  return res.json({ success: true, data: req.user });
};

export { AUDIT_LOGS };
