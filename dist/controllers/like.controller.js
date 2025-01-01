"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLike = exports.createLike = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createLike = async (req, res) => {
    const { userId, replyId, threadId } = req.body;
    try {
        const result = await prisma.like.create({
            data: {
                userId: Number(userId),
                replyId: replyId ? Number(replyId) : null,
                threadId: threadId ? Number(threadId) : null,
            },
        });
        res.status(201).json({
            message: 'CREATE like success',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            detail: error
        });
    }
};
exports.createLike = createLike;
const deleteLike = async (req, res) => {
    const { userId, replyId, threadId } = req.body;
    try {
        const like = await prisma.like.findFirst({
            where: {
                AND: [
                    { userId: Number(userId) },
                    { threadId: Number(threadId) },
                    { replyId: Number(replyId) }
                ]
            }
        });
        if (!like) {
            res.status(404).json({ message: 'like not exist' });
            return;
        }
        const result = await prisma.like.deleteMany({
            where: {
                AND: [
                    { userId: Number(userId) },
                    { threadId: Number(threadId) },
                    { replyId: Number(replyId) }
                ],
            },
        });
        res.status(200).json({
            message: 'DELETE like / unlike success',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
            detail: error
        });
    }
};
exports.deleteLike = deleteLike;
