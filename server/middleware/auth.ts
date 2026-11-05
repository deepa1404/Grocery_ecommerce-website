import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, IUser } from '../db/store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'freshcart-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findUserById(payload.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or session expired' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
}

export function optionalAuthenticateToken(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      const user = db.findUserById(payload.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignored for optional
    }
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
}
