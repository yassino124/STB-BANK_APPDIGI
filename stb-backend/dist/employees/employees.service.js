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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("./employee.schema");
const employee_status_enum_1 = require("../common/enums/employee-status.enum");
const accounts_service_1 = require("../accounts/accounts.service");
const account_schema_1 = require("../accounts/schemas/account.schema");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let EmployeesService = class EmployeesService {
    employeeModel;
    accountsService;
    constructor(employeeModel, accountsService) {
        this.employeeModel = employeeModel;
        this.accountsService = accountsService;
    }
    async create(dto) {
        let finalMatricule = dto.matricule?.toUpperCase();
        if (!finalMatricule) {
            const count = await this.employeeModel.countDocuments();
            finalMatricule = `EMP${(count + 1000).toString()}`;
        }
        const existing = await this.employeeModel.findOne({
            $or: [
                { matricule: finalMatricule },
                { cin: dto.cin.toUpperCase() },
                { email: dto.email.toLowerCase() },
            ],
        });
        if (existing) {
            throw new common_1.ConflictException('Un employé avec ce matricule, CIN ou email existe déjà.');
        }
        const defaultPassword = crypto.randomBytes(4).toString('hex').toUpperCase() + '!A1a';
        const passwordHash = await bcrypt.hash(defaultPassword, 12);
        const employee = await this.employeeModel.create({
            ...dto,
            matricule: finalMatricule,
            cin: dto.cin.toUpperCase(),
            email: dto.email.toLowerCase(),
            dateNaissance: new Date(dto.dateNaissance),
            passwordHash,
            status: employee_status_enum_1.EmployeeStatus.ACTIVE,
            isActivated: true,
            managerId: dto.managerId || null,
            departmentId: dto.departmentId || null,
            branchId: dto.branchId || null,
        });
        try {
            const initialBalance = dto.compteSolde ?? 5000;
            await this.accountsService.createForEmployee(employee._id.toString(), account_schema_1.AccountType.COURANT, initialBalance);
        }
        catch (error) {
            console.error('Failed to create bank account for employee:', error);
        }
        return { employee, defaultPassword, matricule: finalMatricule };
    }
    async findAll(page = 1, limit = 20, search) {
        const query = {};
        if (search) {
            query.$or = [
                { matricule: { $regex: search, $options: 'i' } },
                { nom: { $regex: search, $options: 'i' } },
                { prenom: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.employeeModel
                .find(query)
                .select('-passwordHash -pinHash')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.employeeModel.countDocuments(query),
        ]);
        return { data, total, page, pages: Math.ceil(total / limit) };
    }
    async searchDirectory(search) {
        const query = { status: employee_status_enum_1.EmployeeStatus.ACTIVE };
        if (search && search.length >= 2) {
            query.$or = [
                { matricule: { $regex: search, $options: 'i' } },
                { nom: { $regex: search, $options: 'i' } },
                { prenom: { $regex: search, $options: 'i' } },
                { poste: { $regex: search, $options: 'i' } },
            ];
        }
        return this.employeeModel
            .find(query)
            .select('matricule nom prenom departement poste avatar soldeConges creditsEnCours prime salaireBase compteSolde email phone')
            .limit(100)
            .exec();
    }
    async findOne(id) {
        const employee = await this.employeeModel
            .findById(id)
            .select('-passwordHash -pinHash')
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        return employee;
    }
    async findByMatricule(matricule) {
        const employee = await this.employeeModel
            .findOne({ matricule: matricule.toUpperCase() })
            .select('-passwordHash -pinHash')
            .exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        return employee;
    }
    async updateRoles(id, dto) {
        const employee = await this.employeeModel.findByIdAndUpdate(id, { roles: dto.roles }, { new: true, select: '-passwordHash -pinHash' });
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        return employee;
    }
    async updateStatus(id, dto) {
        const employee = await this.employeeModel.findByIdAndUpdate(id, { status: dto.status }, { new: true, select: '-passwordHash -pinHash' });
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        return employee;
    }
    async getStats() {
        const [total, active, pending, suspended] = await Promise.all([
            this.employeeModel.countDocuments(),
            this.employeeModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.ACTIVE }),
            this.employeeModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.PENDING_ACTIVATION }),
            this.employeeModel.countDocuments({ status: employee_status_enum_1.EmployeeStatus.SUSPENDED }),
        ]);
        return { total, active, pending, suspended };
    }
    async updateFinancials(id, updates) {
        if (updates.soldeConges !== undefined && updates.soldeConges > 90) {
            updates.soldeConges = 90;
        }
        if (updates.compteSolde !== undefined) {
            try {
                const account = await this.accountsService.findByEmployeeId(id);
                if (account) {
                    const employee = await this.employeeModel.findById(id);
                    if (employee) {
                        const currentCompteSolde = employee.compteSolde || 0;
                        const delta = updates.compteSolde - currentCompteSolde;
                        await this.accountsService.updateBalance(account._id.toString(), delta);
                    }
                }
            }
            catch (error) {
                console.error('Failed to sync compteSolde to Account:', error);
            }
        }
        const employee = await this.employeeModel.findByIdAndUpdate(id, { $set: updates }, { new: true, select: '-passwordHash -pinHash' });
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable.');
        return employee;
    }
    async updateAvatar(id, dto) {
        const employee = await this.employeeModel.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        employee.avatar = dto.avatar;
        await employee.save();
        return { success: true, message: 'Avatar updated successfully', data: { avatar: employee.avatar } };
    }
    async getFinanceProfile(employeeId) {
        const employee = await this.employeeModel.findById(employeeId).exec();
        if (!employee)
            throw new common_1.NotFoundException('Employé introuvable');
        const salaireBrut = employee.salaireBase || 1200;
        const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
        const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
        const deductionsSociales = cnss + impot;
        const salaireAvantCredits = salaireBrut - deductionsSociales;
        const creditsEnCours = employee.creditsEnCours || 0;
        const totalMensualitesEstimees = creditsEnCours > 0
            ? Math.min(creditsEnCours * 0.05, salaireAvantCredits * 0.5)
            : 0;
        const salaireNet = Math.round((salaireAvantCredits - totalMensualitesEstimees) * 100) / 100;
        return {
            employeeId: employee._id,
            matricule: employee.matricule,
            nom: `${employee.nom} ${employee.prenom}`,
            salaireBrut,
            cnss,
            impot,
            deductionsSociales,
            salaireAvantCredits,
            creditsEnCours,
            mensualitesCreditsEstimees: Math.round(totalMensualitesEstimees * 100) / 100,
            salaireNet,
            avancesEnCours: employee.avancesEnCours || 0,
            prime: employee.prime || 0,
            soldeConges: employee.soldeConges || 90,
            compteSolde: employee.compteSolde || 0,
        };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => accounts_service_1.AccountsService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        accounts_service_1.AccountsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map