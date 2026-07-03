// backend/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// ── Protect: verify JWT ───────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

// ── RBAC: restrict to roles ───────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };