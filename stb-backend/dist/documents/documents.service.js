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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("./schemas/document.schema");
let DocumentsService = class DocumentsService {
    documentModel;
    employeeModel;
    constructor(documentModel, employeeModel) {
        this.documentModel = documentModel;
        this.employeeModel = employeeModel;
    }
    async generateDocument(employeeId, type) {
        const employee = await this.employeeModel.findById(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employé non trouvé');
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthName = now.toLocaleString('fr-FR', { month: 'long' });
        const typeMap = {
            CONTRACT: {
                type: 'CONTRACT',
                title: `Contrat de Travail - ${employee.prenom} ${employee.nom}`,
                filename: `contrat_${employee.matricule}_${year}.pdf`,
            },
            ATTESTATION: {
                type: 'ATTESTATION',
                title: `Attestation de Travail - ${employee.prenom} ${employee.nom}`,
                filename: `attestation_${employee.matricule}_${year}.pdf`,
            },
            PAYSLIP: {
                type: 'PAYSLIP',
                title: `Fiche de Paie - ${employee.prenom} ${employee.nom} - ${monthName} ${year}`,
                filename: `fichedepaie_${employee.matricule}_${year}_${month}.pdf`,
            },
            LEAVE_CERT: {
                type: 'LEAVE_CERT',
                title: `Attestation d'Absence - ${employee.prenom} ${employee.nom}`,
                filename: `attestation_absence_${employee.matricule}_${year}.pdf`,
            },
            ABSENCE_CERT: {
                type: 'ABSENCE_CERT',
                title: `Attestation d'Absence - ${employee.prenom} ${employee.nom}`,
                filename: `attestation_absence_${employee.matricule}_${year}.pdf`,
            },
        };
        const config = typeMap[type.toUpperCase()];
        if (!config) {
            throw new common_1.BadRequestException(`Type de document invalide: ${type}`);
        }
        const doc = await this.documentModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            type: config.type,
            title: config.title,
            fileName: config.filename,
            fileSize: 0,
            fileUrl: `generated/${config.filename}`,
            mimeType: 'application/pdf',
            description: `Document généré automatiquement pour ${employee.prenom} ${employee.nom}`,
            isRead: false,
            year,
            month,
            generated: true,
        });
        return doc;
    }
    async create(data) {
        const doc = await this.documentModel.create(data);
        return doc;
    }
    async findByEmployee(employeeId, year) {
        const filter = { employeeId, isActive: true };
        if (year)
            filter.year = year;
        const docs = await this.documentModel
            .find(filter)
            .sort({ createdAt: -1 })
            .exec();
        return docs.map((d) => ({
            _id: d._id,
            title: d.title,
            type: d.type,
            fileName: d.fileName,
            fileSize: d.fileSize,
            fileUrl: d.fileUrl,
            mimeType: d.mimeType,
            description: d.description,
            isRead: d.isRead,
            year: d.year,
            month: d.month,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
    async findOne(id) {
        const doc = await this.documentModel.findById(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async markAsRead(id) {
        const doc = await this.documentModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async update(id, data) {
        const doc = await this.documentModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async remove(id) {
        const doc = await this.documentModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return { success: true };
    }
    async getStats(employeeId) {
        const docs = await this.documentModel.find({ employeeId, isActive: true }).exec();
        const unreadCount = docs.filter((d) => !d.isRead).length;
        return {
            total: docs.length,
            unread: unreadCount,
            byType: docs.reduce((acc, doc) => {
                acc[doc.type] = (acc[doc.type] || 0) + 1;
                return acc;
            }, {}),
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.EmployeeDocument.name)),
    __param(1, (0, mongoose_1.InjectModel)('Employee')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map