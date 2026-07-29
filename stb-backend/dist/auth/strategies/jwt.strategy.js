"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../../employees/employee.schema");
const employee_status_enum_1 = require("../../common/enums/employee-status.enum");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    configService;
    employeeModel;
    constructor(configService, employeeModel) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_SECRET', 'fallback_secret'),
        });
        this.configService = configService;
        this.employeeModel = employeeModel;
    }
    async validate(payload) {
        const employee = await this.employeeModel
            .findById(payload.sub)
            .select('status isActivated roles')
            .exec();
        if (!employee) {
            throw new common_1.UnauthorizedException('Employé introuvable');
        }
        if (employee.status === employee_status_enum_1.EmployeeStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Compte suspendu');
        }
        const webRoles = ['RH', 'ADMIN', 'SUPER_ADMIN'];
        const isWebUser = (payload.roles || []).some((r) => webRoles.includes(r));
        if (!employee.isActivated && payload.step !== 'otp_verified' && !isWebUser) {
            throw new common_1.UnauthorizedException('Compte non activé');
        }
        return payload;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map