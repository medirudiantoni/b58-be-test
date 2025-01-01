"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserAlt = exports.getCurrentUser = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const upload_file_1 = __importDefault(require("../middlewares/upload-file"));
const cloudinary_1 = require("../middlewares/cloudinary");
// import User from '../types/user.type';
const prisma = new client_1.PrismaClient();
const getAllUsers = async (req, res) => {
    try {
        const result = await prisma.user.findMany({
            where: {
                isDeleted: 0,
            },
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
            },
        });
        res.status(200).json({
            message: 'GET all users SUCCESS',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! there is something went wrong...',
        });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
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
                Thread: {
                    include: {
                        Like: true,
                        User: true,
                        Reply: true
                    }
                }
            },
        });
        res.status(200).json({
            message: 'GET user by id SUCCESS',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! there is something went wrong...',
        });
    }
};
exports.getUserById = getUserById;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id; // ID user dari token
        const result = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
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
        if (!result) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'GET current user SUCCESS',
            user: {
                username: result.username,
                email: result.email
            },
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! There is something went wrong...!!!',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
exports.updateUserAlt = [
    upload_file_1.default.fields([{ name: 'profile' }, { name: 'background' }]),
    async (req, res) => {
        const multerReq = req;
        const { id } = req.params;
        const { username, fullname, bio } = req.body;
        try {
            // cek user
            const user = await prisma.user.findFirst({
                where: { id: Number(id) },
            });
            if (!user) {
                res.status(400).json({
                    message: 'User not found',
                });
                return;
            }
            // Variabel untuk URL file yang di-upload
            let profile;
            let background;
            if (multerReq.files && multerReq.files['profile']) {
                profile = await (0, cloudinary_1.uploadToCloudinary)(multerReq.files['profile'][0], 'profile');
            }
            // Mengecek jika file background di-upload
            if (multerReq.files && multerReq.files['background']) {
                background = await (0, cloudinary_1.uploadToCloudinary)(multerReq.files['background'][0], 'background');
            }
            // if (username || email) {
            if (username) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        username: username,
                        NOT: { id: Number(id) },
                    },
                });
                if (existingUser) {
                    res.status(400).json({
                        message: 'Username or email already used',
                    });
                    return;
                }
            }
            const updatedUser = await prisma.user.update({
                where: { id: Number(id) },
                data: {
                    fullname: fullname,
                    username: username,
                    bio: bio,
                    profile: profile ? profile.url : user.profile,
                    background: background ? background.url : user.background
                },
            });
            res.status(201).json({
                message: 'Update user data SUCCESS',
                data: updatedUser
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Oops! something went wrong...',
                detail: error,
            });
        }
    }
];
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const isUserExist = await prisma.user.findFirst({
            where: { id: Number(id) },
        });
        if (!isUserExist) {
            res.status(400).json({
                message: 'User not found!',
            });
            return;
        }
        if (isUserExist.id !== req.user.id) {
            res.status(401).json({
                message: 'User not granted to delete this user data',
            });
            return;
        }
        await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                isDeleted: 1,
            },
        });
        const token = req.headers.authorization?.split(' ')[1];
        res.status(200).json({
            message: 'Delete user SUCCESS!',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! something went wrong...',
            detail: error,
        });
    }
};
exports.deleteUser = deleteUser;
