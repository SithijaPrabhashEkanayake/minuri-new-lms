import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { prisma } from './db';
import { NextResponse } from 'next/server';

const client = jwksClient({
  jwksUri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header, callback) {
  if (header.alg === 'HS256') {
    if (process.env.JWT_SECRET) {
      return callback(null, process.env.JWT_SECRET);
    }
    return callback(new Error('HS256 algorithm requested but JWT_SECRET is not configured'));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getSigningKey, { algorithms: ['RS256', 'ES256', 'HS256'] }, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

export async function protect(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyToken(token);
    const userId = decoded.sub;

    const lmsUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!lmsUser) {
      // In some routes like complete-profile, the user doesn't exist yet, so we return the raw decoded ID
      return { id: userId, isNew: true };
    }

    return {
      id: lmsUser.id,
      email: lmsUser.email,
      role: lmsUser.role.name
    };
  } catch (error) {
    console.error('PROTECT ERROR:', error);
    throw new Error('Not authorized, token failed');
  }
}

export function restrictTo(user, ...roles) {
  if (!user || !user.role || !roles.includes(user.role)) {
    throw new Error('Forbidden: You do not have permission to perform this action');
  }
}
