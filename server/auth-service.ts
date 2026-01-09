import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, upsertUser, getUserById } from './db';
import { eq } from 'drizzle-orm';
import type { User } from '../drizzle/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-esta-clave-secreta-en-produccion';
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthToken {
  token: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
  token?: string;
  error?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: AuthPayload): AuthToken {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  return { token, expiresIn: JWT_EXPIRY };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return decoded;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Register a new user locally
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await upsertUser({
      email,
      name: name || email.split('@')[0],
      passwordHash,
      loginMethod: 'local',
      role: 'user',
      isApproved: true,
      lastSignedIn: new Date(),
    });

    // Get created user
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Generate token
    const authToken = generateToken({
      userId: user.id,
      email: user.email || email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.name,
        role: user.role,
      },
      token: authToken.token,
    };
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Login a user locally
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user has local auth
    if (!user.passwordHash) {
      return { success: false, error: 'User does not have local authentication' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last signed in
    await upsertUser({
      email,
      lastSignedIn: new Date(),
    });

    // Generate token
    const authToken = generateToken({
      userId: user.id,
      email: user.email || email,
      role: user.role,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.name,
        role: user.role,
      },
      token: authToken.token,
    };
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await getUserById(payload.userId);
    return user || null;
  } catch (error) {
    console.error('[Auth] Get user from token failed:', error);
    return null;
  }
}
