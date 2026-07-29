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
exports.AuthorizationsController = void 0;
const common_1 = require("@nestjs/common");
const authorizations_service_1 = require("./authorizations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let AuthorizationsController = class AuthorizationsController {
    authorizationsService;
    constructor(authorizationsService) {
        this.authorizationsService = authorizationsService;
    }
    create(req, dto) {
        return this.authorizationsService.create(req.user.sub, dto);
    }
    getMine(req) {
        return this.authorizationsService.getMine(req.user.sub);
    }
    getAll() {
        return this.authorizationsService.getAll();
    }
    getPending() {
        return this.authorizationsService.getAll('PENDING');
    }
    handle(id, req, body) {
        return this.authorizationsService.handle(id, req.user.sub, body.decision, body.commentaire);
    }
};
exports.AuthorizationsController = AuthorizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create authorization request' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthorizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'My authorization requests' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthorizationsController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'All authorization requests (RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthorizationsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Pending authorizations (RH)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthorizationsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/handle'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve/Reject authorization (RH)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AuthorizationsController.prototype, "handle", null);
exports.AuthorizationsController = AuthorizationsController = __decorate([
    (0, swagger_1.ApiTags)('Authorizations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('authorizations'),
    __metadata("design:paramtypes", [authorizations_service_1.AuthorizationsService])
], AuthorizationsController);
//# sourceMappingURL=authorizations.controller.js.map