const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const MailService = require("./mailService");
const TokenService = require("./tokenService");
const UserDto = require("../dtos/userDto");
const ApiError = require("../exceptions/apiError");

class UserService {
  async registration(email, password) {
    const exists = await UserModel.findOne({ email });
    if (exists) {
      throw ApiError.BadRequestError("User with this email is already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 3);

    const activationLink = uuid.v4();

    const user = await UserModel.create({
      email,
      password: hashedPassword,
      activationLink,
    });

    await MailService.sendAtivationLink(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({ ...userDto });

    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequestError("Incorrect activation link");
    }

    user.isActivated = true;

    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw ApiError.BadRequestError("Cannot find user");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log(user.password, password);
      throw ApiError.BadRequestError("Incorrect password");
    }

    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({...userDto});

    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await TokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if(!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const tokenInfo = TokenService.verifyRefreshToken(refreshToken);
    const isTokenExists = TokenService.findToken(refreshToken);

    if(!tokenInfo || !isTokenExists) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(tokenInfo.id);
    const userDto = new UserDto(user);
    const tokens = TokenService.generateTokens({...userDto});

    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
