import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { ok, fail, serialize } from '../utils/response.js';
import { slugify } from '../utils/slugify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) return fail(res, 'E-posta veya şifre hatalı.', 401);

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return fail(res, 'E-posta veya şifre hatalı.', 401);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return ok(res, {
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!admin) return fail(res, 'Yönetici bulunamadı.', 401);
    return ok(res, admin);
  } catch (error) {
    next(error);
  }
}

export async function stats(_req, res, next) {
  try {
    const [productCount, themeCount, orderCount, pendingOrders, categoryCount] = await Promise.all([
      prisma.product.count(),
      prisma.theme.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.category.count(),
    ]);
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
    return ok(res, {
      productCount,
      themeCount,
      orderCount,
      pendingOrders,
      categoryCount,
      recentOrders: serialize(recentOrders),
    });
  } catch (error) {
    next(error);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = slugify(path.basename(file.originalname, ext)) || 'gorsel';
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!okTypes.includes(file.mimetype)) {
      cb(new Error('Sadece jpeg, png, webp, gif veya svg yüklenebilir.'));
      return;
    }
    cb(null, true);
  },
});

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return fail(res, 'Dosya yüklenmedi.', 400);
    const url = `/uploads/${req.file.filename}`;
    return ok(res, { url, filename: req.file.filename }, 'Görsel yüklendi.');
  } catch (error) {
    next(error);
  }
}
