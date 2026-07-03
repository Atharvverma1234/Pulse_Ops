// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Only admin can view all users
router.get(
  '/',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin can update user role
router.patch(
  '/:id/role',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      );
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;