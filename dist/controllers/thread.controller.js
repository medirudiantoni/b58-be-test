"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteThreadById = exports.updateThread = exports.getThreadByUserId = exports.getThreadById = exports.getAllThreads = exports.createNewThread = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../middlewares/cloudinary");
const upload_file_1 = __importDefault(require("../middlewares/upload-file"));
const prisma = new client_1.PrismaClient();
exports.createNewThread = [
    upload_file_1.default.single('image'),
    async (req, res) => {
        const { content, authorId } = req.body;
        try {
            let uploadResult;
            if (req.file) {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file, 'image');
            }
            const data = await prisma.thread.create({
                data: {
                    content,
                    authorId: Number(authorId),
                    image: uploadResult?.url,
                },
            });
            res.status(200).json({
                message: 'CREATE new thread SUCCESS!',
                data,
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Server error',
            });
        }
    },
];
const getAllThreads = async (req, res) => {
    try {
        const data = await prisma.thread.findMany({
            include: {
                User: true,
                Like: true,
                Reply: {
                    include: {
                        Like: true,
                        Children: {
                            include: {
                                Like: true,
                                Children: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                id: "desc"
            }
        });
        res.status(200).json({
            message: 'GET all threads SUCCESS!',
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getAllThreads = getAllThreads;
const getThreadById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await prisma.thread.findUnique({
            where: { id: Number(id) },
            include: {
                User: true,
                Like: true,
                Reply: {
                    where: {
                        parentId: null
                    },
                    orderBy: {
                        id: 'desc'
                    },
                    include: {
                        User: true,
                        Like: true,
                        Children: {
                            include: {
                                User: true,
                                Like: true,
                                Children: true
                            }
                        }
                    }
                }
            }
        });
        if (!data) {
            res.status(404).json({
                message: `thread with id: ${id} is not exist!`,
            });
            return;
        }
        res.status(200).json({
            message: `GET thread with id: ${id} SUCCESS!`,
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getThreadById = getThreadById;
const getThreadByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const data = await prisma.thread.findMany({
            where: {
                authorId: Number(userId)
            },
            include: {
                User: true,
                Like: true,
                Reply: { include: { Like: true } },
            },
            orderBy: {
                id: 'desc'
            }
        });
        if (!data) {
            res.status(404).json({
                message: `thread with id: ${userId} is not exist!`,
            });
            return;
        }
        res.status(200).json({
            message: `GET thread with user id: ${userId} SUCCESS!`,
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getThreadByUserId = getThreadByUserId;
exports.updateThread = [
    upload_file_1.default.single('image'),
    async (req, res) => {
        const { id } = req.params;
        const { content, authorId } = req.body;
        try {
            let uploadResult;
            if (req.file) {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file, 'image');
            }
            const theThread = await prisma.thread.findUnique({
                where: { id: Number(id) },
            });
            if (!theThread) {
                res.status(404).json({
                    message: `thread with id: ${id} is not exist!`,
                });
                return;
            }
            const data = await prisma.thread.update({
                data: {
                    content,
                    authorId: Number(authorId),
                    image: uploadResult ? uploadResult.url : theThread.image,
                },
                where: {
                    id: Number(id),
                },
            });
            res.status(200).json({
                message: `UPDATE thread with id: ${id} SUCCESS!`,
                data,
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Server error',
                detail: error
            });
        }
    },
];
const deleteThreadById = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await prisma.thread.findUnique({ where: { id: Number(id) } });
        if (!data) {
            res.status(404).json({
                message: `thread with id: ${id} is not exist!`,
            });
            return;
        }
        await prisma.thread.delete({ where: { id: Number(id) } });
        res.status(200).json({
            message: `DELETE thread with id: ${id} SUCCESS!`,
            data,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.deleteThreadById = deleteThreadById;
