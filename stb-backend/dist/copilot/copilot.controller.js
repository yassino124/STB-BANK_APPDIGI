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
exports.CopilotController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const copilot_service_1 = require("./copilot.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const employees_service_1 = require("../employees/employees.service");
let CopilotController = class CopilotController {
    copilotService;
    employeesService;
    constructor(copilotService, employeesService) {
        this.copilotService = copilotService;
        this.employeesService = employeesService;
    }
    async chat(user, message) {
        const employee = await this.employeesService.findOne(user.sub);
        const reply = await this.copilotService.chat(employee, message);
        return { reply };
    }
};
exports.CopilotController = CopilotController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: '💬 Chat with STB AI Assistant',
        description: 'Send a message to the Gemini-powered AI assistant. Context is automatically injected.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "chat", null);
exports.CopilotController = CopilotController = __decorate([
    (0, swagger_1.ApiTags)('🤖 Copilot AI'),
    (0, common_1.Controller)('copilot'),
    __metadata("design:paramtypes", [copilot_service_1.CopilotService,
        employees_service_1.EmployeesService])
], CopilotController);
//# sourceMappingURL=copilot.controller.js.map