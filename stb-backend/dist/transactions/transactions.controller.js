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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const swagger_1 = require("@nestjs/swagger");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async findMine(req, employeeId) {
        const userId = employeeId || req.user?.sub;
        if (!userId) {
            return { success: false, statusCode: 400, message: 'Employee ID required', data: [] };
        }
        const result = await this.transactionsService.getMyTransactions(userId);
        return {
            success: true,
            data: {
                data: result.data,
                total: result.total,
                page: result.page,
                limit: 100
            }
        };
    }
    async transfer(req, body) {
        console.log('📥 Full request:', { headers: req.headers, body: req.body, bodyParam: body });
        const requestBody = body || req.body || {};
        console.log('📥 Using body:', JSON.stringify(requestBody));
        const fromEmployeeId = requestBody.fromEmployeeId;
        const toEmployeeId = requestBody.toEmployeeId;
        const toMatricule = requestBody.toMatricule;
        const amount = requestBody.amount || requestBody.montant;
        const description = requestBody.description || requestBody.motif || 'Transfer';
        if (!fromEmployeeId) {
            return { success: false, statusCode: 400, message: 'Missing fromEmployeeId', debug: { receivedBody: requestBody } };
        }
        if (!toEmployeeId && !toMatricule) {
            return { success: false, statusCode: 400, message: 'Missing toEmployeeId or toMatricule', debug: { receivedBody: requestBody } };
        }
        if (!amount || amount <= 0) {
            return { success: false, statusCode: 400, message: 'Invalid amount', debug: { receivedBody: requestBody, amount } };
        }
        try {
            let result;
            if (toEmployeeId) {
                console.log(`✅ Transfer by ID: ${fromEmployeeId} -> ${toEmployeeId}, amount: ${amount}`);
                result = await this.transactionsService.createTransferById(fromEmployeeId, toEmployeeId, amount, description);
            }
            else if (toMatricule) {
                console.log(`✅ Transfer by Matricule: ${fromEmployeeId} -> ${toMatricule}, amount: ${amount}`);
                result = await this.transactionsService.createTransfer(fromEmployeeId, toMatricule, amount, description);
            }
            console.log('✅ Transfer successful:', result._id);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ Transfer error:', error.message, error.stack);
            throw error;
        }
    }
    async findEmployeeTx(id) {
        const transactions = await this.transactionsService.getEmployeeTransactions(id);
        return { success: true, data: transactions };
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions for logged in user' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: false, description: 'Employee ID (temporary fallback)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findMine", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer money between employees' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                fromEmployeeId: { type: 'string', description: 'Sender employee ID' },
                toEmployeeId: { type: 'string', description: 'Receiver employee ID (alternative to toMatricule)' },
                toMatricule: { type: 'string', description: 'Receiver matricule (alternative to toEmployeeId)' },
                amount: { type: 'number', description: 'Transfer amount (also accepts montant)' },
                montant: { type: 'number', description: 'Transfer amount (alternative to amount)' },
                description: { type: 'string' },
                motif: { type: 'string', description: 'Transfer reason (alternative to description)' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('employee/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions for specific employee (RH)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findEmployeeTx", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map