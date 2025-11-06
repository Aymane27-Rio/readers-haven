import jwt from 'jsonwebtoken';

export const decodeToken = (authHeader, secret) => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, secret);
    return { id: payload.id, payload };
  } catch (_) {
    return null;
  }
};

export const verifyJWT = (secret) => (req, res, next) => {
  const auth = req.headers['authorization'] || '';
  const decoded = decodeToken(auth, secret);
  if (!decoded) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  req.user = { id: decoded.id };
  next();
};
