import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
import { Request, RequestStatus, RequestType } from './schemas/request.schema';
import { Employee } from '../employees/employee.schema';
import { Transaction, TransactionType, TransactionStatus, TransactionCategory } from '../transactions/schemas/transaction.schema';
import { Account } from '../accounts/schemas/account.schema';
import { StringUtil } from '../common/utils/string.util';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, createRequestDto: CreateRequestDto) {
    const { employeeId: _employeeId, ...dto } = createRequestDto;
    const request = new this.requestModel({
      employeeId: new Types.ObjectId(employeeId),
      ...dto,
    });
    const saved = await request.save();

    // Notify RH admin room of new request in real-time
    this.realtimeGateway.server?.to('admin').emit('new_request', {
      requestId: saved._id,
      employeeId,
      type: saved.type,
      status: saved.status,
      payload: saved.payload,
      createdAt: (saved as any).createdAt,
    });

    return saved;
  }

  async findAllByEmployee(employeeId: string) {
    return this.requestModel.find({ employeeId: new Types.ObjectId(employeeId) }).sort({ createdAt: -1 }).exec();
  }

  async findAll() {
    return this.requestModel.find().populate('employeeId', 'nom prenom matricule').sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, updateDto: UpdateRequestStatusDto) {
    const request = await this.requestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Request not found');

    request.status = updateDto.status as RequestStatus;
    if (updateDto.responseMessage) {
      request.responseMessage = updateDto.responseMessage;
    }

    let updatedEmployee: any = null;
    if (request.status === RequestStatus.APPROUVE) {
      updatedEmployee = await this.processApproval(request);
    }

    const saved = await request.save();

    // ── Notify employee with notification saved in DB ────────────────
    const employeeIdStr = request.employeeId.toString();
    const isApproved = request.status === RequestStatus.APPROUVE;
    const isRejected = request.status === RequestStatus.REFUSE;
    
    if (isApproved || isRejected) {
      const typeLabels: Record<string, string> = {
        CONGE: 'Congé',
        AVANCE: 'Avance sur salaire',
        CREDIT: 'Crédit',
        PRIME: 'Prime',
        DOCUMENT: 'Document',
        AUTORISATION: 'Autorisation',
      };
      const typeLabel = typeLabels[request.type] || request.type;
      
      let title: string;
      let body: string;
      
      if (isApproved) {
        const amount = request.payload?.amount ? ` — ${Number(request.payload.amount).toLocaleString('fr-TN')} TND` : '';
        title = `✅ ${typeLabel} approuvée`;
        body = `Votre demande de ${typeLabel}${amount} a été approuvée${request.responseMessage ? ` : ${request.responseMessage}` : '.'}`;  
      } else {
        title = `❌ ${typeLabel} rejetée`;
        body = `Votre demande de ${typeLabel} a été refusée${request.responseMessage ? ` : ${request.responseMessage}` : '.'}`;
      }
      
      // Save notification in DB
      const savedNotif = await this.notificationsService.sendToEmployee(
        employeeIdStr, title, body, NotificationType.HR_REQUEST,
        { requestId: id, requestType: request.type, status: request.status }
      );
      
      // Push real-time via WebSocket
      this.realtimeGateway.server?.to(`user:${employeeIdStr}`).emit('notification', {
        _id: savedNotif._id, title, body, type: NotificationType.HR_REQUEST,
        isRead: false, createdAt: new Date(), data: { requestType: request.type },
      });
    }

    const updatePayload = {
      requestId: id,
      type: request.type,
      status: request.status,
      payload: request.payload,
      responseMessage: request.responseMessage,
      // Send updated employee financials so app can update immediately
      updatedEmployee: updatedEmployee ? {
        soldeConges: updatedEmployee.soldeConges,
        creditsEnCours: updatedEmployee.creditsEnCours,
        prime: updatedEmployee.prime,
        compteSolde: updatedEmployee.compteSolde,
        avancesEnCours: updatedEmployee.avancesEnCours,
      } : null,
    };

    // Push to the specific employee's socket room
    this.realtimeGateway.server?.to(`user:${employeeIdStr}`).emit('request_updated', updatePayload);

    // Also push to admin room to refresh their list
    this.realtimeGateway.server?.to('admin').emit('request_status_changed', updatePayload);

    return saved;
  }

  private async processApproval(request: Request): Promise<any> {
    const employee = await this.employeeModel.findById(request.employeeId).exec();
    if (!employee) return null;

    if (request.type === RequestType.CONGE) {
      const startDate = request.payload.startDate ? new Date(request.payload.startDate) : null;
      const endDate = request.payload.endDate ? new Date(request.payload.endDate) : null;
      let days = Number(request.payload.days) || 0;
      if (!days && startDate && endDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }
      
      if (employee.soldeConges < days) {
        throw new BadRequestException(`Solde insuffisant. Vous demandez ${days} jours, solde disponible: ${employee.soldeConges}`);
      }
      employee.soldeConges -= days;

    } else if (request.type === RequestType.AVANCE) {
      const amount = Number(request.payload.amount) || 0;
      const maxAvance = (employee.salaireBase || 1200) * 0.5;
      
      if (amount > maxAvance) {
        throw new BadRequestException(`Le montant de l'avance (${amount} TND) dépasse 50% du salaire de base (${maxAvance} TND)`);
      }
      
      // Update avancesEnCours instead of creditsEnCours
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
          type: TransactionType.DEPOSIT,
          category: TransactionCategory.INCOME,
          description: 'Avance sur salaire',
          status: TransactionStatus.COMPLETED,
          reference: StringUtil.generateReference('AVN'),
          metadata: { requestId: request._id },
        });
      }

    } else if (request.type === RequestType.CREDIT) {
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
          type: TransactionType.DEPOSIT,
          category: TransactionCategory.INCOME,
          description: 'Crédit accordé',
          status: TransactionStatus.COMPLETED,
          reference: StringUtil.generateReference('CRD'),
          metadata: { requestId: request._id },
        });
      }

    } else if (request.type === RequestType.PRIME) {
      const amount = Number(request.payload.amount) || 0;
      const primeTitle = request.payload.title || 'Prime';
      
      // Check if this type of prime was already granted this year
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);
      
      const existingPrimeRequest = await this.requestModel.findOne({
        employeeId: employee._id,
        type: RequestType.PRIME,
        status: RequestStatus.APPROUVE,
        'payload.title': primeTitle,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }).exec();

      if (existingPrimeRequest && existingPrimeRequest._id.toString() !== request._id.toString()) {
        throw new BadRequestException(`L'employé a déjà reçu une ${primeTitle} cette année.`);
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
          type: TransactionType.PRIME,
          category: TransactionCategory.INCOME,
          description: `Prime accordée : ${primeTitle}`,
          status: TransactionStatus.COMPLETED,
          reference: StringUtil.generateReference('PRM'),
          metadata: { requestId: request._id },
        });
      }
    }
    
    return employee.save();
  }
}
