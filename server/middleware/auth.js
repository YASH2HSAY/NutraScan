const jwt = require('jsonwebtoken');

// Pull "Bearer <token>" out of the Authorization header, or return null
function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

// Protected routes: a valid token is required
function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Login required.' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Open routes that personalise when logged in:
// no token = anonymous, bad token = 401, good token = known user
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = { requireAuth, optionalAuth };