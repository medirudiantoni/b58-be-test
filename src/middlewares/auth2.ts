import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY =
  process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';

// Perluas tipe Request untuk menambahkan `user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export function authentication2(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer token

  if (!token) {
    res.status(401).json({ message: 'Access token missing or invalid' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      username: string;
    };

    // Simpan data user di req.user
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}
