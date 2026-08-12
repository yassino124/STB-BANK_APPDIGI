import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SecurityConfig } from './common/constants/security.config';
import { RealtimeGateway } from './realtime/realtime.gateway';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json(), // Structured JSON logging
          ),
        }),
      ],
    }),
    bodyParser: false,
  });

  // ─── Increase payload limit for base64 images ────────────────
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ─── Global Prefix ───────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── CORS ────────────────────────────────────────────────────
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = SecurityConfig.CORS_ORIGINS;
      if (!origin || allowedOrigins.some((o) => origin.includes(o))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  });

  // ─── Security Headers ────────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // ─── Request ID ──────────────────────────────────────────────
  app.use((req, res, next) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  // ─── Validation ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Interceptors ─────────────────────────────────────
  app.useGlobalInterceptors(
    new TransformInterceptor(), 
    new LoggingInterceptor(),
    new TimeoutInterceptor() // Global Circuit Breaker (10s timeout)
  );

  // ─── Global Exception Filter ─────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Socket.io Gateway ───────────────────────────────────────
  const realtimeGateway = app.get(RealtimeGateway);
  const server = app.getHttpAdapter().getInstance();
  realtimeGateway.listen(server);

  // ─── Swagger ─────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('🏦 STB Backend API')
    .setDescription(
      `
## STB Enterprise Banking Backend

### Authentication Flow
- **Activation**: Matricule + CIN + Date of Birth → OTP → Password → PIN → Biometrics
- **Login**: Employee ID/Matricule + Password → JWT Access Token + Refresh Token
- **Biometric**: Device fingerprint verification → Immediate dashboard access
- **PIN Fallback**: 6-digit PIN when biometrics fail

### Security Layers
\`\`\`
Password → OTP → PIN → Face ID/Fingerprint → JWT → Refresh Token
\`\`\`

### Roles
| Role | Description |
|------|-------------|
| EMPLOYEE | Standard bank employee |
| RH | Human Resources - manages accounts |
| MANAGER | Branch/department manager |
| FINANCE | Finance department |
| ADMIN | System administrator |
| SUPER_ADMIN | Full system access |
      `,
    )
    .setVersion('2.0.0')
    .addTag('🔐 Auth', 'Authentication & Authorization')
    .addTag('👤 Employees', 'Employee management (RH only)')
    .addTag('📱 Devices', 'Trusted device management')
    .addTag('🔑 Sessions', 'Session management')
    .addTag('📊 Audit Logs', 'Activity audit trail')
    .addTag('🏦 Banking', 'Accounts, Cards, Transactions')
    .addTag('💳 Payments', 'QR, Bills, Recharge')
    .addTag('📈 Investments', 'Investment management')
    .addTag('🤖 AI Copilot', 'AI Assistant')
    .addTag('💬 Messaging', 'Internal communications')
    .addTag('🛡️ Security', 'Fraud detection and risk alerts')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
    },
    customSiteTitle: 'STB API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
      .swagger-ui .topbar .topbar-wrapper .link { content: 'STB Backend API'; }
      body { background: #0f0f1a; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🏦 STB Backend v2.0 running on: http://localhost:${port}`);
  console.log(`📚 Swagger Docs:            http://localhost:${port}/docs`);
  console.log(`🌐 API Base:                http://localhost:${port}/api/v1`);
  console.log(`🔌 WebSocket:               ws://localhost:${port}\n`);
}

bootstrap();
