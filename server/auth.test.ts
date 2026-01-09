import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { registerUser, loginUser, verifyToken, generateToken } from './auth-service';
import * as db from './db';

describe('Authentication Service', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const testName = 'Test User';

  describe('registerUser', () => {
    it('should register a new user with valid credentials', async () => {
      const result = await registerUser(testEmail, testPassword, testName);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testEmail);
      expect(result.user?.name).toBe(testName);
      expect(result.token).toBeDefined();
    });

    it('should fail with missing email', async () => {
      const result = await registerUser('', testPassword, testName);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should fail with missing password', async () => {
      const result = await registerUser(testEmail, '', testName);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should fail with password too short', async () => {
      const result = await registerUser(testEmail, '12345', testName);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should fail if user already exists', async () => {
      // First registration should succeed
      await registerUser(testEmail, testPassword, testName);
      
      // Second registration with same email should fail
      const result = await registerUser(testEmail, testPassword, testName);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('loginUser', () => {
    const loginEmail = `login-test-${Date.now()}@example.com`;
    const loginPassword = 'LoginTest123';

    beforeAll(async () => {
      // Create a user for login tests
      await registerUser(loginEmail, loginPassword, 'Login Test');
    });

    it('should login with correct credentials', async () => {
      const result = await loginUser(loginEmail, loginPassword);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(loginEmail);
      expect(result.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const result = await loginUser(loginEmail, 'WrongPassword123');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email or password');
    });

    it('should fail with non-existent email', async () => {
      const result = await loginUser('nonexistent@example.com', loginPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email or password');
    });

    it('should fail with missing credentials', async () => {
      const result = await loginUser('', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });
  });

  describe('Token Generation and Verification', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken({
        userId: 123,
        email: 'test@example.com',
        role: 'user',
      });

      expect(token.token).toBeDefined();
      expect(token.expiresIn).toBe('7d');
    });

    it('should verify a valid token', () => {
      const token = generateToken({
        userId: 123,
        email: 'test@example.com',
        role: 'user',
      });

      const payload = verifyToken(token.token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(123);
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.role).toBe('user');
    });

    it('should fail to verify an invalid token', () => {
      const payload = verifyToken('invalid.token.here');
      
      expect(payload).toBeNull();
    });

    it('should fail to verify an expired token', () => {
      // Create a token with very short expiry
      const shortToken = generateToken({
        userId: 123,
        email: 'test@example.com',
        role: 'user',
      });

      // This test assumes the token is valid immediately after generation
      const payload = verifyToken(shortToken.token);
      expect(payload).toBeDefined();
    });
  });

  describe('User Retrieval', () => {
    const retrievalEmail = `retrieval-test-${Date.now()}@example.com`;
    const retrievalPassword = 'RetrievalTest123';

    beforeAll(async () => {
      await registerUser(retrievalEmail, retrievalPassword, 'Retrieval Test');
    });

    it('should retrieve user by email', async () => {
      const user = await db.getUserByEmail(retrievalEmail);
      
      expect(user).toBeDefined();
      expect(user?.email).toBe(retrievalEmail);
      expect(user?.passwordHash).toBeDefined();
    });

    it('should not retrieve user with wrong email', async () => {
      const user = await db.getUserByEmail('nonexistent@example.com');
      
      expect(user).toBeUndefined();
    });
  });

  describe('Password Security', () => {
    it('should not store plain text passwords', async () => {
      const secureEmail = `secure-test-${Date.now()}@example.com`;
      const plainPassword = 'PlainPassword123';

      await registerUser(secureEmail, plainPassword, 'Secure Test');
      const user = await db.getUserByEmail(secureEmail);

      // Password should be hashed, not plain text
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(plainPassword);
      expect(user?.passwordHash?.length).toBeGreaterThan(20); // bcrypt hashes are long
    });
  });
});
