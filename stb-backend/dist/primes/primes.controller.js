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
exports.PrimesController = void 0;
const common_1 = require("@nestjs/common");
const primes_service_1 = require("./primes.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let PrimesController = class PrimesController {
    primesService;
    constructor(primesService) {
        this.primesService = primesService;
    }
    create(req, dto) {
        return this.primesService.create(req.user.sub, dto);
    }
    adminCreate(req, dto) {
        return this.primesService.adminCreate(req.user.sub, dto);
    }
    distribute(req, dto) {
        return this.primesService.distributeToAll(req.user.sub, dto);
    }
    getMine(req) {
        return this.primesService.getMyPrimes(req.user.sub);
    }
    getAll() {
        return this.primesService.getAllPrimes();
    }
    getPending() {
        return this.primesService.getAllPrimes('PENDING');
    }
    handle(id, req, body) {
        return this.primesService.handle(id, req.user.sub, body.decision);
    }
};
exports.PrimesController = PrimesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Request a prime (Employee)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('admin-create'),
    (0, swagger_1.ApiOperation)({ summary: 'Attribuer une prime à un employé (Finance/Admin) — créditée immédiatement' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "adminCreate", null);
__decorate([
    (0, common_1.Post)('distribute'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribuer une prime à tous les employés actifs (Finance/Admin)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "distribute", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My primes' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'All primes (RH/Finance)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Pending primes (RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/handle'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject prime (RH)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PrimesController.prototype, "handle", null);
exports.PrimesController = PrimesController = __decorate([
    (0, swagger_1.ApiTags)('Primes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('primes'),
    __metadata("design:paramtypes", [primes_service_1.PrimesService])
], PrimesController);
//# sourceMappingURL=primes.controller.js.map