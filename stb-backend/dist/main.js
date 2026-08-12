"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const winston = __importStar(require("winston"));
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const security_config_1 = require("./common/constants/security.config");
const realtime_gateway_1 = require("./realtime/realtime.gateway");
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.timestamp(), winston.format.ms(), winston.format.json()),
                }),
            ],
        }),
        bodyParser: false,
    });
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = security_config_1.SecurityConfig.CORS_ORIGINS;
            if (!origin || allowedOrigins.some((o) => origin.includes(o))) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-Request-ID'],
        credentials: true,
        maxAge: 86400,
    });
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        next();
    });
    app.use((req, res, next) => {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-ID', requestId);
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor(), new logging_interceptor_1.LoggingInterceptor(), new timeout_interceptor_1.TimeoutInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const realtimeGateway = app.get(realtime_gateway_1.RealtimeGateway);
    const server = app.getHttpAdapter().getInstance();
    realtimeGateway.listen(server);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('🏦 STB Backend API')
        .setDescription(`
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
      `)
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
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
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
//# sourceMappingURL=main.js.map