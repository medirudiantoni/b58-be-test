"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = authentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';
function authentication(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // bearer token
    if (!token) {
        res.status(401).json({ message: 'Access token missing or invalid' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = decoded;
        // req.body.authorId = decoded.id;
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
}
