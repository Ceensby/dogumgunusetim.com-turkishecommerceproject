import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export function requireAdmin(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      const err = new Error('Yönetici girişi gerekli.');
      err.status = 401;
      throw err;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (error) {
    if (error.status) return next(error);
    const err = new Error('Oturum geçersiz veya süresi dolmuş.');
    err.status = 401;
    next(err);
  }
}

export async function loadAdmin(req, _res, next) {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!admin) {
      const err = new Error('Yönetici bulunamadı.');
      err.status = 401;
      throw err;
    }
    req.adminUser = admin;
    next();
  } catch (error) {
    next(error);
  }
}
