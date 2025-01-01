"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestionUsers = exports.getFollowerUsers = exports.getFollowingUsers = exports.unfollow = exports.follow = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const follow = async (req, res) => {
    const { id } = req.params;
    const { followingId } = req.body;
    try {
        const result = await prisma.userFollow.create({
            data: {
                followingId: Number(followingId),
                followerId: Number(id), // yang difollow
            },
        });
        res.status(201).json({
            message: 'Follow user success',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.follow = follow;
const unfollow = async (req, res) => {
    const { id } = req.params;
    const { followingId } = req.body;
    try {
        const followExists = await prisma.userFollow.findFirst({
            where: {
                followingId: Number(followingId),
                followerId: Number(id), // yang diunfollow
            },
        });
        if (!followExists) {
            res.status(404).json({ message: 'Follow relationship does not exist.' });
            return;
        }
        await prisma.userFollow.deleteMany({
            where: {
                followingId: Number(followingId),
                followerId: Number(id), // yang diunfollow
            },
        });
        res.status(201).json({
            message: 'Unfollow user success',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.unfollow = unfollow;
const getFollowingUsers = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.userFollow.findMany({
            where: {
                followingId: Number(id)
            },
            include: {
                follower: true
            }
        });
        res.status(200).json({
            message: 'GET all following SUCCESS',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getFollowingUsers = getFollowingUsers;
const getFollowerUsers = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.userFollow.findMany({
            where: {
                followerId: Number(id)
            },
            include: {
                following: {
                    include: {
                        follower: true
                    }
                },
                follower: true
            },
        });
        res.status(200).json({
            message: 'GET all followers SUCCESS',
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Server error',
        });
    }
};
exports.getFollowerUsers = getFollowerUsers;
const getSuggestionUsers = async (req, res) => {
    try {
        const userId = req.user?.id; // ID user dari token
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // level 1: user yang belum di follow back
        const notFollowedBack = await prisma.user.findMany({
            where: {
                following: {
                    some: {
                        followerId: Number(userId), // id pengguna saat ini
                    },
                },
                follower: {
                    none: {
                        followingId: Number(userId), // id user saat ini
                    },
                },
                isDeleted: 0, // dan juga tidak dalam keadaan akun yang dihapus sementara (soft-delete)
            },
            take: 5 // tampilkan sebanyak 5 saja
        });
        // Ambil semua / ekstrak id-nya saja dari hasil notFollowedBack di atas dan jadikan sebagai suggestion level 1
        const level1Ids = notFollowedBack.map((user) => user.id);
        // level 2: Ambil atau temukan semua data user kecuali yang sudah ada di level 1 di atas dan urutkan dari yang paling banyak followernya>>>
        const allRandomUsersOrderByMostFollowers = await prisma.user.findMany({
            where: {
                id: {
                    notIn: [...level1Ids, Number(userId)], // tidak ada di level 1
                },
                isDeleted: 0, // yang tidak dihapus
                follower: {
                    none: {
                        followingId: Number(userId), // id user yang sekarang
                    },
                },
            },
            orderBy: {
                follower: {
                    _count: 'desc' // yang jumlahnya paling besar ke paling kecil
                }
            },
            take: 10 // tampilkan hasilnya sebanyak 10 hasil.
        });
        // Gabungkan kedua level di atas menjadi satu array yaitu suggestions:
        const suggestions = [
            ...notFollowedBack,
            ...allRandomUsersOrderByMostFollowers
        ];
        res.status(200).json({
            message: 'GET user suggestions SUCCESS',
            data: suggestions,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Oops! Something went wrong...',
            detail: error,
        });
    }
};
exports.getSuggestionUsers = getSuggestionUsers;
