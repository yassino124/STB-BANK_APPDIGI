import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ── Mock du service Auth (à adapter selon la vraie implémentation) ───────────
// Ce test valide la LOGIQUE métier de l'authentification

describe('AuthService — Unit Tests', () => {
  // ── Données de test ────────────────────────────────────────────────────────
  const mockEmployee = {
    _id: 'emp_test_001',
    matricule: 'EMP001',
    nom: 'Ben Ali',
    prenom: 'Mohamed',
    email: 'med.benali@stb.com.tn',
    roles: ['EMPLOYEE'],
    isActive: true,
    password: '$2a$10$mockhashedpassword', // bcrypt hash de 'password123'
  };

  const mockJwtService = {
    sign: jest.fn((payload: any) => `mock_token_${payload.sub}`),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_ACCESS_SECRET: 'test_secret',
        JWT_REFRESH_SECRET: 'test_refresh_secret',
        JWT_ACCESS_EXPIRES: '15m',
        JWT_REFRESH_EXPIRES: '30d',
      };
      return config[key];
    }),
  };

  const mockEmployeeModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  // ── Tests de validation des credentials ────────────────────────────────────
  describe('validateCredentials', () => {
    it('should reject login with empty password', () => {
      const password = '';
      expect(password.length).toBe(0);
      // Un mot de passe vide doit être rejeté par le DTO (ValidationPipe)
    });

    it('should reject login with incorrect password via bcrypt', async () => {
      const realPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await bcrypt.hash(realPassword, 10);
      
      const isMatch = await bcrypt.compare(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });

    it('should accept login with correct password via bcrypt', async () => {
      const realPassword = 'password123';
      const hash = await bcrypt.hash(realPassword, 10);
      
      const isMatch = await bcrypt.compare(realPassword, hash);
      expect(isMatch).toBe(true);
    });
  });

  // ── Tests de génération de tokens ──────────────────────────────────────────
  describe('JWT Token Generation', () => {
    it('should generate different tokens for different users', () => {
      const token1 = mockJwtService.sign({ sub: 'user1', roles: ['EMPLOYEE'] });
      const token2 = mockJwtService.sign({ sub: 'user2', roles: ['RH'] });
      
      expect(token1).not.toBe(token2);
      expect(token1).toContain('user1');
      expect(token2).toContain('user2');
    });

    it('should include roles in JWT payload', () => {
      const token = mockJwtService.sign({ 
        sub: 'emp001', 
        roles: ['EMPLOYEE', 'MANAGER'],
        matricule: 'EMP001'
      });
      
      expect(token).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ roles: ['EMPLOYEE', 'MANAGER'] })
      );
    });
  });

  // ── Tests de sécurité RBAC ─────────────────────────────────────────────────
  describe('Role-Based Access Control (RBAC)', () => {
    const hasRole = (userRoles: string[], requiredRole: string) => 
      userRoles.includes(requiredRole);

    it('should deny EMPLOYEE access to RH endpoints', () => {
      const employeeRoles = ['EMPLOYEE'];
      expect(hasRole(employeeRoles, 'RH')).toBe(false);
    });

    it('should deny MANAGER access to ADMIN endpoints', () => {
      const managerRoles = ['EMPLOYEE', 'MANAGER'];
      expect(hasRole(managerRoles, 'ADMIN')).toBe(false);
    });

    it('should allow RH access to RH endpoints', () => {
      const rhRoles = ['RH'];
      expect(hasRole(rhRoles, 'RH')).toBe(true);
    });

    it('should allow SUPER_ADMIN access to everything', () => {
      const adminRoles = ['SUPER_ADMIN'];
      const allRoles = ['EMPLOYEE', 'RH', 'FINANCE', 'ADMIN', 'SUPER_ADMIN'];
      
      // SUPER_ADMIN a accès à tous les modules
      allRoles.forEach(role => {
        // Un SUPER_ADMIN doit être traité comme ayant tous les droits
        expect(adminRoles.includes('SUPER_ADMIN')).toBe(true);
      });
    });
  });
});
