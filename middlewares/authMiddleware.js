const ApiError = require("../exceptions/apiError");
const tokenService = require("../service/tokenService");

module.exports = function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authHeader.split(" ")[1];
        
        if(!accessToken) {
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.verifyAccessToken(accessToken);

        if(!userData) {
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData;
        next();
    } catch (error) {
        return next(ApiError.UnauthorizedError())
    }
}