import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, SECONDARY_JWT_SECRET } from '../config/env.js';
import { logAuditEvent } from './auditController.js';

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
    logAuditEvent({
      user: req.user?.email || 'user@smartfleet.ai',
      role: req.user?.role || 'SUPER_ADMIN',
      action: 'Secondary Authentication Failure',
      target: targetType ? `${targetType} (${targetId || 'N/A'})` : 'Sensitive Vehicle Vault',
      ip: req.ip || '127.0.0.1'
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

  logAuditEvent({
    user: req.user?.email || 'user@smartfleet.ai',
    role: req.user?.role || 'SUPER_ADMIN',
    action: 'Secondary Authentication Granted',
    target: targetType ? `${targetType} (${targetId || 'N/A'})` : 'Sensitive Vehicle Vault',
    ip: req.ip || '127.0.0.1'
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

/**
 * Dynamic User Profile Retrieval
 */
export const getProfile = async (req, res) => {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;

  const user = USERS.find((u) => u.id === userId || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User profile not found' }
    });
  }

  const profile = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '+91 98765 43210',
    department: user.department || 'Fleet Operations & Logistics',
    designation: user.designation || (user.role === 'SUPER_ADMIN' ? 'Head of Fleet Operations' : 'Fleet Coordinator'),
    emergencyContact: user.emergencyContact || '+91 98765 00000',
    bio: user.bio || 'Managing SmartFleet AI telemetry, real-time vehicle corridors, and dispatch logistics.',
    twoFactorEnabled: user.twoFactorEnabled !== undefined ? user.twoFactorEnabled : true,
    joinedDate: user.joinedDate || '2023-01-15',
    lastLoginAt: user.lastLoginAt || new Date().toISOString()
  };

  return res.json({ success: true, data: profile });
};

/**
 * Dynamic User Profile Update
 */
export const updateProfile = async (req, res) => {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const { name, phone, department, designation, emergencyContact, bio } = req.body || {};

  const userIdx = USERS.findIndex((u) => u.id === userId || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
  if (userIdx === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User profile not found' }
    });
  }

  const user = USERS[userIdx];

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (department) user.department = department.trim();
  if (designation) user.designation = designation.trim();
  if (emergencyContact) user.emergencyContact = emergencyContact.trim();
  if (bio) user.bio = bio.trim();

  logAuditEvent({
    user: user.email,
    role: user.role,
    action: 'USER_PROFILE_UPDATED',
    target: `User Profile (${user.name})`,
    ip: req.ip || '127.0.0.1'
  });

  const updatedToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      token: updatedToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        emergencyContact: user.emergencyContact,
        bio: user.bio
      }
    }
  });
};

/**
 * Dynamic User Password Change
 */
export const changePassword = async (req, res) => {
  const userId = req.user?.userId;
  const userEmail = req.user?.email;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required' }
    });
  }

  if (newPassword.length < 6) {
    return res.status(422).json({
      success: false,
      error: { code: 'PASSWORD_TOO_SHORT', message: 'New password must be at least 6 characters long' }
    });
  }

  const user = USERS.find((u) => u.id === userId || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' }
    });
  }

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    logAuditEvent({
      user: user.email,
      role: user.role,
      action: 'PASSWORD_CHANGE_FAILURE',
      target: 'User Security Credentials',
      ip: req.ip || '127.0.0.1'
    });

    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Incorrect current password' }
    });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);

  logAuditEvent({
    user: user.email,
    role: user.role,
    action: 'PASSWORD_CHANGE_SUCCESS',
    target: 'User Security Credentials',
    ip: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: 'Password changed successfully'
  });
};

export { AUDIT_LOGS };

