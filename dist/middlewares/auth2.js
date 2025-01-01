"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication2 = authentication2;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';
function authentication2(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer token
    if (!token) {
        res.status(401).json({ message: 'Access token missing or invalid' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        // Simpan data user di req.user
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(403).json({ message: 'Token expired' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
}
