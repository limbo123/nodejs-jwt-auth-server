module.exports = class ApiError extends Error {
    statusCode;
    errors;

    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    static UnauthorizedError() {
        return new ApiError(401, "User is not authorized");
    }

    static BadRequestError(message, errors = []) {
        return new ApiError(400, message, errors)
    }
}