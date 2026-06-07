const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { prisma } = require('../config/db');

const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: false
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      if (header.alg === 'HS256' && process.env.JWT_SECRET) {
        return callback(null, process.env.JWT_SECRET);
      }
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const protect = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, getSigningKey, { algorithms: ['RS256', 'ES256', 'HS256'] }, async (err, decoded) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed', error: err.message });
    }

    try {
      const userId = decoded.sub;
      const lmsUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });

      if (!lmsUser) {
        return res.status(401).json({ message: 'User profile not found in LMS database. Please complete registration.' });
      }

      req.user = {
        id: lmsUser.id,
        email: lmsUser.email,
        role: lmsUser.role.name
      };

      next();
    } catch (dbErr) {
      console.error('DB lookup error in protect middleware:', dbErr.message);
      return res.status(500).json({ message: 'Server error during auth' });
    }
  });
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
