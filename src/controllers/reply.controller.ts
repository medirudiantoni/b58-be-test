import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import upload from '../middlewares/upload-file';
import { uploadToCloudinary } from '../middlewares/cloudinary';
const prisma = new PrismaClient();

export const createReply = [
  upload.single('image'),
  async (req: Request, res: Response) => {
    const { content, authorId, threadId, parentId } = req.body;
    try {
      let uploadResult;
      if (req.file) {
        uploadResult = await uploadToCloudinary(req.file, 'image');
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
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
      });
    }
  },
];

export const getAllReply = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};

export const getReplyById = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};

export const updateReply = [
  upload.single('image'),
  async (req: Request, res: Response) => {
  const { content, authorId, threadId, parentId } = req.body;
  const { id } = req.params;
  try {
    let uploadResult;
    if (req.file) {
      uploadResult = await uploadToCloudinary(req.file, 'image');
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
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
}];

export const deleteReply = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reply = await prisma.reply.findUnique({
        where: {
            id: Number(id)
        }
    });
    if(!reply){
        res.status(404).json({
            message: "Reply not found!"
        });
        return;
    };

    await prisma.reply.update({
      data: {
        isDeleted: true
      },
      where: { id: Number(id) },
    });
    res.status(200).json({
      message: 'DELETE Reply success',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
    });
  }
};
