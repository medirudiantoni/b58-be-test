"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReply = exports.updateReply = exports.getReplyById = exports.getAllReply = exports.createReply = void 0;
const client_1 = require("@prisma/client");
const upload_file_1 = __importDefault(require("../middlewares/upload-file"));
const cloudinary_1 = require("../middlewares/cloudinary");
const prisma = new client_1.PrismaClient();
exports.createReply = [
    upload_file_1.default.single('image'),
    async (req, res) => {
        const { content, authorId, threadId, parentId } = req.body;
        try {
            let uploadResult;
            if (req.file) {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file, 'image');
            }
            const thread = await prisma.thread.findUnique({
                where: { id: Number(threadId) },
            });
            if (!thread) {
                res.status(404).json({
                    message: 'Thread not found',
                });
                return;
            }
            if (parentId) {
                const parentReply = await prisma.reply.findUnique({
                    where: { id: Number(parentId) },
                });
                if (!parentReply) {
                    res.status(404).json({ message: 'Parent reply not found' });
                    return;
                }
                if (parentReply.threadId !== Number(threadId)) {
                    res
                        .status(404)
                        .json({ message: 'Parent reply does not belong to this thread' });
                    return;
                }
            }
            const reply = await prisma.reply.create({
                data: {
                    content,
                    authorId: Number(authorId),
                    threadId: Number(threadId),
                    parentId: Number(parentId),
                    image: uploadResult?.url,
                },
            });
            res.status(201).json({
                message: 'CREATE Reply success',
                data: reply,
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Server error',
            });
        }
    },
];
const getAllReply = async (req, res) => {
    try {
        const result = await prisma.reply.findMany({
            include: {
                User: true,
                Like: true,
                Children: {
                    include: {
                        User: true,
                        Like: true,
                        Children: {
                            include: {
                                User: true,
                                Like: true,
                                Children: {
                                    include: {
                                        User: true,
                                        Like: true,
                                        Children: {
                                            include: {
                                                User: true,
                                                Like: true,
                                                Children: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json({
            message: 'GET all Reply success',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getAllReply = getAllReply;
const getReplyById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.reply.findUnique({
            where: { id: Number(id) },
            include: {
                User: true,
                Like: true,
                Children: {
                    include: {
                        User: true,
                        Like: true,
                        Children: {
                            include: {
                                User: true,
                                Like: true,
                                Children: {
                                    include: {
                                        User: true,
                                        Like: true,
                                        Children: {
                                            include: {
                                                User: true,
                                                Like: true,
                                                Children: {
                                                    include: {
                                                        User: true,
                                                        Like: true,
                                                        Children: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json({
            message: 'GET all Reply success',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getReplyById = getReplyById;
exports.updateReply = [
    upload_file_1.default.single('image'),
    async (req, res) => {
        const { content, authorId, threadId, parentId } = req.body;
        const { id } = req.params;
        try {
            let uploadResult;
            if (req.file) {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file, 'image');
            }
            const theReply = await prisma.reply.findUnique({
                where: { id: Number(id) },
            });
            const result = await prisma.reply.update({
                data: {
                    content,
                    authorId: Number(authorId),
                    threadId: Number(threadId),
                    parentId: Number(parentId),
                    image: uploadResult ? uploadResult.url : theReply?.image,
                },
                where: { id: Number(id) },
            });
            res.status(201).json({
                message: 'UPDATE Reply success',
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                message: 'Server error',
            });
        }
    }
];
const deleteReply = async (req, res) => {
    const { id } = req.params;
    try {
        const reply = await prisma.reply.findUnique({
            where: {
                id: Number(id)
            }
        });
        if (!reply) {
            res.status(404).json({
                message: "Reply not found!"
            });
            return;
        }
        ;
        await prisma.reply.update({
            data: {
                isDeleted: true
            },
            where: { id: Number(id) },
        });
        res.status(200).json({
            message: 'DELETE Reply success',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.deleteReply = deleteReply;
