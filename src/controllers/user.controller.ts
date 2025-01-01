import { Request, RequestHandler, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import upload from '../middlewares/upload-file';
import { uploadToCloudinary } from '../middlewares/cloudinary';
// import User from '../types/user.type';
const prisma = new PrismaClient();

interface MulterRequest extends Request {
  files?: {
    profile?: Express.Multer.File[];
    background?: Express.Multer.File[];
  };
}

export const getAllUsers = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Oops! there is something went wrong...',
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      message: 'Oops! there is something went wrong...',
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id// ID user dari token
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
  } catch (error) {
    res.status(500).json({
      message: 'Oops! There is something went wrong...!!!',
    });
  }
};

export const updateUserAlt = [
  upload.fields([{ name: 'profile' }, { name: 'background' }]),
  async (req: Request, res: Response) => {
  const multerReq = req as MulterRequest;
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
      profile = await uploadToCloudinary(multerReq.files['profile'][0], 'profile');
    }

    // Mengecek jika file background di-upload
    if (multerReq.files && multerReq.files['background']) {
      background = await uploadToCloudinary(multerReq.files['background'][0], 'background');
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
  } catch (error) {
    res.status(500).json({
      message: 'Oops! something went wrong...',
      detail: error,
    });
  }
}];

export const deleteUser = async (req: Request, res: Response) => {
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
    if (isUserExist.id !== (req as any).user.id) {
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
  } catch (error) {
    res.status(500).json({
      message: 'Oops! something went wrong...',
      detail: error,
    });
  }
};
