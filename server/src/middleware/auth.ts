import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { config } from '../config';

let initialized = false;

function initializeFirebase() {
  if (initialized) return;
  const serviceAccountJson = config.firebaseServiceAccountJson;
  if (serviceAccountJson) {
    const credential = admin.credential.cert(JSON.parse(serviceAccountJson));
    admin.initializeApp({ credential });
    initialized = true;
  }
}

export async function requireAuthIfEnabled(req: Request, res: Response, next: NextFunction) {
  try {
    if (config.disableAuth) {
      return next();
    }
    initializeFirebase();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}


