const userService = require("../service/userService");
const { validationResult, cookie } = require("express-validator");
const ApiError = require("../exceptions/apiError");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);

      if(!errors.isEmpty()) {
        return next(ApiError.BadRequestError("Autentification error", errors.array()));
      }

      const { email, password } = req.body;
      const userInfo = await userService.registration(email, password);


      res.cookie("refreshToken", userInfo.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userInfo);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userInfo = await userService.login(email, password);

      res.cookie("refreshToken", userInfo.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userInfo);
    } catch (error) {

      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");

      return res.json(token)
    } catch (error) {}
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);

      return res.redirect(process.env.CLIENT_URL);

    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userInfo = await userService.refresh(refreshToken);
      res.cookie("refreshToken", userInfo.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

      return res.json(userInfo);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
