import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeDocument, DocumentDocument } from './schemas/document.schema';
import { Employee, EmployeeDocument as EmployeeDoc } from '../employees/employee.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(EmployeeDocument.name) private documentModel: Model<DocumentDocument>,
    @InjectModel('Employee') private employeeModel: Model<EmployeeDoc>,
  ) {}

  async generateDocument(employeeId: string, type: string) {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthName = now.toLocaleString('fr-FR', { month: 'long' });

    const typeMap: Record<string, { type: string; title: string; filename: string }> = {
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
      throw new BadRequestException(`Type de document invalide: ${type}`);
    }

    const doc = await this.documentModel.create({
      employeeId: new Types.ObjectId(employeeId),
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
    } as any);

    return doc;
  }

  async create(data: Partial<EmployeeDocument>) {
    const doc = await this.documentModel.create(data);
    return doc;
  }

  async findByEmployee(employeeId: string, year?: number) {
    const filter: any = { employeeId, isActive: true };
    if (year) filter.year = year;

    const docs = await this.documentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((d: any) => ({
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

  async findOne(id: string) {
    const doc = await this.documentModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async markAsRead(id: string) {
    const doc = await this.documentModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, data: Partial<EmployeeDocument>) {
    const doc = await this.documentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.documentModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return { success: true };
  }

  async getStats(employeeId: string) {
    const docs = await this.documentModel.find({ employeeId, isActive: true }).exec();
    const unreadCount = docs.filter((d) => !d.isRead).length;

    return {
      total: docs.length,
      unread: unreadCount,
      byType: docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}