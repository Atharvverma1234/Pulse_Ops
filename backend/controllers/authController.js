// backend/controllers/authController.js
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// ── Register ─────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ name, email, password, role });

    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ── Get current user (me) ─────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe };