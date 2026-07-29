"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const employee_schema_1 = require("../employees/employee.schema");
const device_schema_1 = require("../devices/device.schema");
const session_schema_1 = require("../sessions/session.schema");
const otp_module_1 = require("../otp/otp.module");
const audit_module_1 = require("../audit/audit.module");
const employees_service_1 = require("../employees/employees.service");
const accounts_module_1 = require("../accounts/accounts.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.get('JWT_ACCESS_SECRET', 'fallback_secret'),
                    signOptions: {
                        expiresIn: config.get('JWT_ACCESS_EXPIRES', '15m'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
                { name: device_schema_1.Device.name, schema: device_schema_1.DeviceSchema },
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
            ]),
            otp_module_1.OtpModule,
            audit_module_1.AuditModule,
            (0, common_1.forwardRef)(() => accounts_module_1.AccountsModule),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard, employees_service_1.EmployeesService],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map