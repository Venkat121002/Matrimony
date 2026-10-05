import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'tamil_nikah_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
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
    user.checkTrialStatus();

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
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'tamil_nikah_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended) {
        user.checkTrialStatus();
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
};
