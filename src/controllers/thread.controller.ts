import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../middlewares/cloudinary';
import upload from '../middlewares/upload-file';
const prisma = new PrismaClient();

export const createNewThread = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { content, authorId } = req.body;
    try {
      let uploadResult;
      if (req.file) {
        uploadResult = await uploadToCloudinary(req.file, 'image');
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
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
      });
    }
  },
];

export const getAllThreads = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};

export const getThreadById = async (req: Request, res: Response) => {
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
    })
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};

export const getThreadByUserId = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};

export const updateThread = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, authorId } = req.body;
    try {
      let uploadResult;
      if (req.file) {
        uploadResult = await uploadToCloudinary(req.file, 'image');
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
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        detail: error
      });
    }
  },
];

export const deleteThreadById = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};
