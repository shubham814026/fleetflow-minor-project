import jwt from 'jsonwebtoken';
import { SECONDARY_JWT_SECRET } from '../config/env.js';

export const secondaryAuthMiddleware = (req, res, next) => {
  const secondaryToken = req.headers['x-secondary-auth'];
  if (!secondaryToken) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'SECONDARY_AUTH_REQUIRED',
        message: 'Secondary authentication required to access sensitive credentials'
      }
    });
  }

  try {
    const decoded = jwt.verify(secondaryToken, SECONDARY_JWT_SECRET);
    req.secondaryAuth = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'SECONDARY_AUTH_INVALID',
        message: 'Secondary authentication session expired or invalid'
      }
    });
  }
};

export default secondaryAuthMiddleware;
