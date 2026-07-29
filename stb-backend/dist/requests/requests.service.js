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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const request_schema_1 = require("./schemas/request.schema");
const employee_schema_1 = require("../employees/employee.schema");
const transaction_schema_1 = require("../transactions/schemas/transaction.schema");
const account_schema_1 = require("../accounts/schemas/account.schema");
const string_util_1 = require("../common/utils/string.util");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/schemas/notification.schema");
let RequestsService = class RequestsService {
    requestModel;
    employeeModel;
    transactionModel;
    accountModel;
    realtimeGateway;
    notificationsService;
    constructor(requestModel, employeeModel, transactionModel, accountModel, realtimeGateway, notificationsService) {
        this.requestModel = requestModel;
        this.employeeModel = employeeModel;
        this.transactionModel = transactionModel;
        this.accountModel = accountModel;
        this.realtimeGateway = realtimeGateway;
        this.notificationsService = notificationsService;
    }
    async create(employeeId, createRequestDto) {
        const { employeeId: _employeeId, ...dto } = createRequestDto;
        const request = new this.requestModel({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            ...dto,
        });
        const saved = await request.save();
        this.realtimeGateway.server?.to('admin').emit('new_request', {
            requestId: saved._id,
            employeeId,
            type: saved.type,
            status: saved.status,
            payload: saved.payload,
            createdAt: saved.createdAt,
        });
        return saved;
    }
    async findAllByEmployee(employeeId) {
        return this.requestModel.find({ employeeId: new mongoose_2.Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
    }
    async findAll() {
        return this.requestModel.find().populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
    }
    async updateStatus(id, updateDto) {
        const request = await this.requestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Request not found');
        request.status = updateDto.status;
        if (updateDto.responseMessage) {
            request.responseMessage = updateDto.responseMessage;
        }
        let updatedEmployee = null;
        if (request.status === request_schema_1.RequestStatus.APPROUVE) {
            updatedEmployee = await this.processApproval(request);
        }
        const saved = await request.save();
        const employeeIdStr = request.employeeId.toString();
        const isApproved = request.status === request_schema_1.RequestStatus.APPROUVE;
        const isRejected = request.status === request_schema_1.RequestStatus.REFUSE;
        if (isApproved || isRejected) {
            const typeLabels = {
                CONGE: 'Congé',
                AVANCE: 'Avance sur salaire',
                CREDIT: 'Crédit',
                PRIME: 'Prime',
                DOCUMENT: 'Document',
                AUTORISATION: 'Autorisation',
            };
            const typeLabel = typeLabels[request.type] || request.type;
            let title;
            let body;
            if (isApproved) {
                const amount = request.payload?.amount ? ` — ${Number(request.payload.amount).toLocaleString('fr-TN')} TND` : '';
                title = `✅ ${typeLabel} approuvée`;
                body = `Votre demande de ${typeLabel}${amount} a été approuvée${request.responseMessage ? ` : ${request.responseMessage}` : '.'}`;
            }
            else {
                title = `❌ ${typeLabel} rejetée`;
                body = `Votre demande de ${typeLabel} a été refusée${request.responseMessage ? ` : ${request.responseMessage}` : '.'}`;
            }
            const savedNotif = await this.notificationsService.sendToEmployee(employeeIdStr, title, body, notification_schema_1.NotificationType.HR_REQUEST, { requestId: id, requestType: request.type, status: request.status });
            this.realtimeGateway.server?.to(`user:${employeeIdStr}`).emit('notification', {
                _id: savedNotif._id, title, body, type: notification_schema_1.NotificationType.HR_REQUEST,
                isRead: false, createdAt: new Date(), data: { requestType: request.type },
            });
        }
        const updatePayload = {
            requestId: id,
            type: request.type,
            status: request.status,
            payload: request.payload,
            responseMessage: request.responseMessage,
            updatedEmployee: updatedEmployee ? {
                soldeConges: updatedEmployee.soldeConges,
                creditsEnCours: updatedEmployee.creditsEnCours,
                prime: updatedEmployee.prime,
                compteSolde: updatedEmployee.compteSolde,
                avancesEnCours: updatedEmployee.avancesEnCours,
            } : null,
        };
        this.realtimeGateway.server?.to(`user:${employeeIdStr}`).emit('request_updated', updatePayload);
        this.realtimeGateway.server?.to('admin').emit('request_status_changed', updatePayload);
        return saved;
    }
    async processApproval(request) {
        const employee = await this.employeeModel.findById(request.employeeId).exec();
        if (!employee)
            return null;
        if (request.type === request_schema_1.RequestType.CONGE) {
            const startDate = request.payload.startDate ? new Date(request.payload.startDate) : null;
            const endDate = request.payload.endDate ? new Date(request.payload.endDate) : null;
            let days = Number(request.payload.days) || 0;
            if (!days && startDate && endDate) {
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
            }
            if (employee.soldeConges < days) {
                throw new common_1.BadRequestException(`Solde insuffisant. Vous demandez ${days} jours, solde disponible: ${employee.soldeConges}`);
            }
            employee.soldeConges -= days;
        }
        else if (request.type === request_schema_1.RequestType.AVANCE) {
            const amount = Number(request.payload.amount) || 0;
            const maxAvance = (employee.salaireBase || 1200) * 0.5;
            if (amount > maxAvance) {
                throw new common_1.BadRequestException(`Le montant de l'avance (${amount} TND) dépasse 50% du salaire de base (${maxAvance} TND)`);
            }
            employee.avancesEnCours = (employee.avancesEnCours || 0) + amount;
            employee.compteSolde = (employee.compteSolde || 0) + amount;
            const account = await this.accountModel.findOne({ employeeId: employee._id }).exec();
            if (account) {
                account.solde += amount;
                await account.save();
                await this.transactionModel.create({
                    employeeId: employee._id,
                    accountId: account._id,
                    montant: amount,
                    type: transaction_schema_1.TransactionType.DEPOSIT,
                    category: transaction_schema_1.TransactionCategory.INCOME,
                    description: 'Avance sur salaire',
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    reference: string_util_1.StringUtil.generateReference('AVN'),
                    metadata: { requestId: request._id },
                });
            }
        }
        else if (request.type === request_schema_1.RequestType.CREDIT) {
            const amount = Number(request.payload.amount) || 0;
            employee.creditsEnCours = (employee.creditsEnCours || 0) + amount;
            employee.compteSolde = (employee.compteSolde || 0) + amount;
            const account = await this.accountModel.findOne({ employeeId: employee._id }).exec();
            if (account) {
                account.solde += amount;
                await account.save();
                await this.transactionModel.create({
                    employeeId: employee._id,
                    accountId: account._id,
                    montant: amount,
                    type: transaction_schema_1.TransactionType.DEPOSIT,
                    category: transaction_schema_1.TransactionCategory.INCOME,
                    description: 'Crédit accordé',
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    reference: string_util_1.StringUtil.generateReference('CRD'),
                    metadata: { requestId: request._id },
                });
            }
        }
        else if (request.type === request_schema_1.RequestType.PRIME) {
            const amount = Number(request.payload.amount) || 0;
            const primeTitle = request.payload.title || 'Prime';
            const currentYear = new Date().getFullYear();
            const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
            const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);
            const existingPrimeRequest = await this.requestModel.findOne({
                employeeId: employee._id,
                type: request_schema_1.RequestType.PRIME,
                status: request_schema_1.RequestStatus.APPROUVE,
                'payload.title': primeTitle,
                createdAt: { $gte: startOfYear, $lte: endOfYear }
            }).exec();
            if (existingPrimeRequest && existingPrimeRequest._id.toString() !== request._id.toString()) {
                throw new common_1.BadRequestException(`L'employé a déjà reçu une ${primeTitle} cette année.`);
            }
            employee.prime = (employee.prime || 0) + amount;
            employee.compteSolde = (employee.compteSolde || 0) + amount;
            const account = await this.accountModel.findOne({ employeeId: employee._id }).exec();
            if (account) {
                account.solde += amount;
                await account.save();
                await this.transactionModel.create({
                    employeeId: employee._id,
                    accountId: account._id,
                    montant: amount,
                    type: transaction_schema_1.TransactionType.PRIME,
                    category: transaction_schema_1.TransactionCategory.INCOME,
                    description: `Prime accordée : ${primeTitle}`,
                    status: transaction_schema_1.TransactionStatus.COMPLETED,
                    reference: string_util_1.StringUtil.generateReference('PRM'),
                    metadata: { requestId: request._id },
                });
            }
        }
        return employee.save();
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(2, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __param(3, (0, mongoose_1.InjectModel)(account_schema_1.Account.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map