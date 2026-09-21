import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    data: null,
    error: 'İstenen kaynak bulunamadı.',
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error('[hata]', err);

  if (err instanceof ZodError) {
    const first = err.errors[0];
    return res.status(400).json({
      success: false,
      data: null,
      error: first?.message || 'Geçersiz istek.',
      details: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Bu kayıt zaten mevcut (benzersiz alan çakışması).',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Kayıt bulunamadı.',
      });
    }
  }

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      data: err.data ?? null,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    data: null,
    error: 'Beklenmeyen bir sunucu hatası oluştu.',
  });
}

export function createHttpError(status, message, data) {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}
