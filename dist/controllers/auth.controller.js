"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
exports.login = login;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
const SECRET_KEY = process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';
const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({
            message: 'All fields are required',
        });
        return;
    }
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            res.status(400).json({
                message: 'Username or email already exist',
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({
            message: 'User register SUCCESS',
            data: newUser,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! Something went wrong...',
            detail: error,
        });
    }
};
exports.register = register;
async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                following: {
                    include: {
                        follower: true,
                    },
                },
                follower: {
                    include: {
                        following: true,
                    },
                },
                Like: true
            },
        });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }
        // compare password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (isMatch) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.status(200).json({
                message: 'Login Successful',
                token,
                user: {
                    username: user.username,
                    email: user.email,
                },
                data: user,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
}
