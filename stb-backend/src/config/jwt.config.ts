import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  accessExpiry: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRES || '30d',
  issuer: process.env.JWT_ISSUER || 'stb-backend',
  audience: process.env.JWT_AUDIENCE || 'stb-mobile',
}));
