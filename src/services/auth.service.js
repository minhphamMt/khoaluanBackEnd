import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const authService = {
  register: async ({ email, password, displayName }) => {
    if (!JWT_SECRET) throw new Error("JWT secret not configured");
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const error = new Error("Email already registered");
      error.status = 400;
      throw error;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      password: hash,
      displayName,
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { user: sanitizeUser(user), token };
  },

  login: async ({ email, password }) => {
    if (!JWT_SECRET) throw new Error("JWT secret not configured");
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 400;
      throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error("Invalid email or password");
      error.status = 400;
      throw error;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { user: sanitizeUser(user), token };
  },

  me: async (userId) => {
    const user = await userRepository.findById(userId);
    return sanitizeUser(user);
  },
};

export default authService;
