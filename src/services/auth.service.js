import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prisma.js"; // bạn cần tạo file prisma client

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  register: async (req, res) => {
    const { email, password } = req.body;

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) return res.status(400).json({ message: "Email exists" });

    const hash = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hash },
    });

    return res.json(user);
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token });
  },

  me: async (req, res) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return res.json(user);
  },
};

export default authService;
