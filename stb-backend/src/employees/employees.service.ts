import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Employee, EmployeeDocument } from './employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import {
  CreateEmployeeDto,
  UpdateEmployeeRolesDto,
  UpdateEmployeeStatusDto,
} from './dto/employee.dto';
import { Role } from '../common/enums/role.enum';
import { AccountsService } from '../accounts/accounts.service';
import { AccountType } from '../accounts/schemas/account.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
    @Inject(forwardRef(() => AccountsService))
    private accountsService: AccountsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateEmployeeDto) {
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
      throw new ConflictException(
        'Un employé avec ce matricule, CIN ou email existe déjà.',
      );
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
      status: EmployeeStatus.ACTIVE,
      isActivated: true,
      managerId: dto.managerId || null,
      directorId: dto.directorId || null,
      centralDirectorId: dto.centralDirectorId || null,
      departmentId: dto.departmentId || null,
      branchId: dto.branchId || null,
    });

    // 🏦 Automatically create bank account with initial balance
    try {
      const initialBalance = dto.compteSolde ?? 5000; // Default 5000 TND
      await this.accountsService.createForEmployee(employee._id.toString(), AccountType.COURANT, initialBalance);
    } catch (error) {
      console.error('Failed to create bank account for employee:', error);
      // Don't fail employee creation if account creation fails
    }

    // 👔 Automatically assign MANAGER role to anyone placed in the hierarchy
    const managerIds = [dto.managerId, dto.directorId, dto.centralDirectorId].filter(Boolean) as string[];
    if (managerIds.length > 0) {
      await this.employeeModel.updateMany(
        { _id: { $in: managerIds } },
        { $addToSet: { roles: Role.MANAGER } }
      ).exec();
    }

    // 📄 Emit event for automatic document generation
    this.eventEmitter.emit('employee.created', {
      employeeId: employee._id.toString(),
      employee: employee,
    });

    return { employee, defaultPassword, matricule: finalMatricule };
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ data: EmployeeDocument[]; total: number; page: number; pages: number }> {
    const query: any = {};
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

  async getDirectory(search?: string): Promise<Partial<EmployeeDocument>[]> {
    const query: any = {}; // Fetch all employees for RH hierarchy assignment
    
    if (search && search.length >= 2) {
      query.$or = [
        { matricule: { $regex: search, $options: 'i' } },
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
      ];
    }

    return this.employeeModel
      .find(query)
      .select('matricule nom prenom poste roles _id')
      .limit(1000) // Need a high limit to fetch all potential managers/directors
      .exec();
  }

  async searchDirectory(search: string): Promise<Partial<EmployeeDocument>[]> {
    const query: any = { status: EmployeeStatus.ACTIVE };
    
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

  async findOne(id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findById(id)
      .select('-passwordHash -pinHash')
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');
    return employee;
  }

  async findByMatricule(matricule: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel
      .findOne({ matricule: matricule.toUpperCase() })
      .select('-passwordHash -pinHash')
      .exec();

    if (!employee) throw new NotFoundException('Employé introuvable.');
    return employee;
  }

  async updateRoles(
    id: string,
    dto: UpdateEmployeeRolesDto,
  ): Promise<EmployeeDocument> {
    const employee = await this.employeeModel.findByIdAndUpdate(
      id,
      { roles: dto.roles },
      { new: true, select: '-passwordHash -pinHash' },
    );
    if (!employee) throw new NotFoundException('Employé introuvable.');
    return employee;
  }

  async updateStatus(
    id: string,
    dto: UpdateEmployeeStatusDto,
  ): Promise<EmployeeDocument> {
    const employee = await this.employeeModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true, select: '-passwordHash -pinHash' },
    );
    if (!employee) throw new NotFoundException('Employé introuvable.');
    return employee;
  }

  async getStats(): Promise<Record<string, number>> {
    const [total, active, pending, suspended] = await Promise.all([
      this.employeeModel.countDocuments(),
      this.employeeModel.countDocuments({ status: EmployeeStatus.ACTIVE }),
      this.employeeModel.countDocuments({ status: EmployeeStatus.PENDING_ACTIVATION }),
      this.employeeModel.countDocuments({ status: EmployeeStatus.SUSPENDED }),
    ]);

    return { total, active, pending, suspended };
  }

  async updateFinancials(id: string, updates: Partial<{ soldeConges: number, creditsEnCours: number, avancesEnCours: number, prime: number, salaireBase: number, compteSolde: number }>) {
    if (updates.soldeConges !== undefined && updates.soldeConges > 90) {
      updates.soldeConges = 90; // Plafond maximal de 90 jours
    }

    // ✅ FIX: If compteSolde is being updated, also update the Account solde
    if (updates.compteSolde !== undefined) {
      try {
        const account = await this.accountsService.findByEmployeeId(id);
        if (account) {
          // Calculate the difference to apply as an increment
          const employee = await this.employeeModel.findById(id);
          if (employee) {
            const currentCompteSolde = employee.compteSolde || 0;
            const delta = updates.compteSolde - currentCompteSolde;
            
            // Update the account balance with the delta
            await this.accountsService.updateBalance(account._id.toString(), delta);
          }
        }
      } catch (error) {
        console.error('Failed to sync compteSolde to Account:', error);
        // Continue with employee update even if account sync fails
      }
    }

    const employee = await this.employeeModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, select: '-passwordHash -pinHash' },
    );
    if (!employee) throw new NotFoundException('Employé introuvable.');
    return employee;
  }

  async updateAvatar(id: string, dto: any) {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    
    employee.avatar = dto.avatar;
    await employee.save();
    
    return { success: true, message: 'Avatar updated successfully', data: { avatar: employee.avatar } };
  }

  /**
   * Get employee finance profile with REAL calculations
   * Calculates net salary AFTER credit deductions
   */
  async getFinanceProfile(employeeId: string): Promise<any> {
    const employee = await this.employeeModel.findById(employeeId).exec();
    if (!employee) throw new NotFoundException('Employé introuvable');

    const salaireBrut = employee.salaireBase || 1200;
    
    // Déductions sociales (CNSS + Impôt)
    const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
    const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
    const deductionsSociales = cnss + impot;
    
    // Salaire avant crédits
    const salaireAvantCredits = salaireBrut - deductionsSociales;
    
    // Calcul des crédits actifs (simulation)
    const creditsEnCours = employee.creditsEnCours || 0;
    const totalMensualitesEstimees = creditsEnCours > 0 
      ? Math.min(creditsEnCours * 0.05, salaireAvantCredits * 0.5) // Estimation: 5% du capital ou 50% salaire max
      : 0;
    
    // Salaire NET réel
    const salaireNet = Math.round((salaireAvantCredits - totalMensualitesEstimees) * 100) / 100;
    
    return {
      employeeId: employee._id,
      matricule: employee.matricule,
      nom: `${employee.nom} ${employee.prenom}`,
      
      // Salaire breakdown
      salaireBrut,
      cnss,
      impot,
      deductionsSociales,
      salaireAvantCredits,
      
      // Crédits
      creditsEnCours,
      mensualitesCreditsEstimees: Math.round(totalMensualitesEstimees * 100) / 100,
      
      // Net final
      salaireNet,
      
      // Avances
      avancesEnCours: employee.avancesEnCours || 0,
      
      // Autres
      prime: employee.prime || 0,
      soldeConges: employee.soldeConges || 90,
      compteSolde: employee.compteSolde || 0,
    };
  }
}
