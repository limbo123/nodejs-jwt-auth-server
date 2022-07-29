const jwt = require("jsonwebtoken");
const tokenModel = require("../models/tokenModel");
class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "30d" });
        return {
            accessToken,
            refreshToken
        }
    }

    verifyAccessToken(accessToken) {
        try {
            const data = jwt.verify(accessToken, process.env.ACCESS_SECRET);
            return data;
        } catch (error) {
            return null
        }
    }

    verifyRefreshToken(refreshToken) {
        try {
            const data = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
            return data;
        } catch (error) {
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: userId });
        if(tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const token = await tokenModel.create({ user: userId, refreshToken })
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken });
        return tokenData;
    }
}

module.exports = new TokenService();