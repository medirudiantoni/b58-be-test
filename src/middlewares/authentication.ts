import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY =
  process.env.SECRET_KEY || 'aksjdkl2aj3djaklfji32dj2dj9ld92jd92j';

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

export function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(' ')[1]; // bearer token

  if (!token) {
    res.status(401).json({ message: 'Access token missing or invalid' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      username: string;
    };

    (req as any).user = decoded;

    // req.body.authorId = decoded.id;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
}
