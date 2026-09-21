import { randomUUID } from 'crypto';

/**
 * Misafir sepeti için X-Cart-Session başlığını okur; yoksa üretir.
 */
export function cartSession(req, res, next) {
  const incoming = req.header('X-Cart-Session');
  const sessionId =
    incoming && incoming.length >= 8 && incoming.length <= 80 ? incoming : randomUUID();
  req.cartSessionId = sessionId;
  res.setHeader('X-Cart-Session', sessionId);
  next();
}
