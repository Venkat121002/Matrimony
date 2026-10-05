import jwt from 'jsonwebtoken';
import { getUserById, checkTrialStatus } from '../models/users.js';
import { getJwtSecret } from '../config/secrets.js';

const readToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return req.headers['x-access-token'] || null;
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = readToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User no longer exists.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact customer support.',
      });
    }

    // Refresh trial status if applicable
    checkTrialStatus(user);

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await getUserById(decoded.id);
      if (user && !user.isSuspended) {
        checkTrialStatus(user);
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
};
