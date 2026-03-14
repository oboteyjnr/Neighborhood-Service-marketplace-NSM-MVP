const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { USER_ROLES } = require("../utils/constants");

function toUserDto(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "name, email, password and role are required" });
  }

  if (!Object.values(USER_ROLES).includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role
  });

  return res.status(201).json({ user: toUserDto(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.user = {
    id: String(user._id),
    role: user.role
  };

  return res.status(200).json({ user: toUserDto(user) });
});

const logout = asyncHandler(async (req, res) => {
  if (!req.session) {
    return res.status(200).json({ message: "Logged out" });
  }

  await new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  res.clearCookie("nsm.sid");
  return res.status(200).json({ message: "Logged out" });
});

const me = asyncHandler(async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({ user: toUserDto(user) });
});

module.exports = {
  register,
  login,
  logout,
  me
};
