import authService from "../services/auth.service.js";

const authController = {
  register: (req, res) => authService.register(req, res),
  login: (req, res) => authService.login(req, res),
  me: (req, res) => authService.me(req, res),
};

export default authController;
