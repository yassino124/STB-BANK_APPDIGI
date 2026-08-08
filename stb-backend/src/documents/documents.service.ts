import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { EmployeeDocument, DocumentDocument, DocumentType } from './schemas/document.schema';
import { Employee, EmployeeDocument as EmployeeDoc } from '../employees/employee.schema';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Helper: convert pdf stream to base64
function streamToBase64(doc: PDFKit.PDFDocument): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve('data:application/pdf;base64,' + Buffer.concat(chunks).toString('base64')));
    doc.on('error', reject);
    doc.end();
  });
}

// STB Brand Colors
const STB_BLUE = '#0A2A6E';
const STB_LIGHT_BLUE = '#1B4FD8';
const STB_GOLD = '#C8932A';
const STB_GRAY = '#6B7280';
const STB_LIGHT_GRAY = '#F3F4F6';
const STB_WHITE = '#FFFFFF';
const STB_DARK = '#111827';

function drawSTBHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  // Blue header bar
  doc.rect(0, 0, doc.page.width, 110).fill(STB_BLUE);

  // Gold accent stripe
  doc.rect(0, 105, doc.page.width, 5).fill(STB_GOLD);

  // Logo
  try {
    const logoPath = '/Users/mohamedyassineouertani/Downloads/stb_mobile/public/logo for splash.png';
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 30, 25, { width: 60 });
    } else {
      doc.circle(60, 55, 30).fill(STB_LIGHT_BLUE);
      doc.fontSize(10).fillColor(STB_WHITE).font('Helvetica-Bold').text('STB', 47, 49);
    }
  } catch (e) {
    doc.circle(60, 55, 30).fill(STB_LIGHT_BLUE);
    doc.fontSize(10).fillColor(STB_WHITE).font('Helvetica-Bold').text('STB', 47, 49);
  }

  // Bank Name
  doc.fontSize(20).fillColor(STB_WHITE).font('Helvetica-Bold').text('Société Tunisienne de Banque', 105, 22);
  doc.fontSize(10).fillColor('#93C5FD').font('Helvetica').text('STB Bank — Portail RH Enterprise', 105, 47);

  // Document title right-aligned
  doc.fontSize(11).fillColor(STB_GOLD).font('Helvetica-Bold').text(title.toUpperCase(), 105, 67);
  doc.fontSize(9).fillColor('#CBD5E1').font('Helvetica').text(subtitle, 105, 83);

  // Reset position
  doc.y = 130;
  doc.fillColor(STB_DARK);
}

function drawSTBFooter(doc: PDFKit.PDFDocument) {
  const pageHeight = doc.page.height;
  doc.rect(0, pageHeight - 50, doc.page.width, 50).fill(STB_BLUE);
  doc.fontSize(8).fillColor('#93C5FD').font('Helvetica')
    .text('© 2025 Société Tunisienne de Banque — Document confidentiel — www.stb.com.tn', 30, pageHeight - 32, { align: 'center' });

  // Page number
  doc.fillColor(STB_GOLD).text(`Document généré automatiquement par STB RH Système`, 30, pageHeight - 18, { align: 'center' });
}

function drawSeparator(doc: PDFKit.PDFDocument, y?: number) {
  const posY = y || doc.y;
  doc.moveTo(50, posY).lineTo(doc.page.width - 50, posY).strokeColor(STB_GOLD).lineWidth(1.5).stroke();
  doc.y = posY + 12;
}

function drawSection(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5);
  doc.rect(50, doc.y, doc.page.width - 100, 24).fill(STB_BLUE);
  doc.fontSize(10).fillColor(STB_WHITE).font('Helvetica-Bold').text(title.toUpperCase(), 62, doc.y - 18);
  doc.moveDown(0.8);
  doc.fillColor(STB_DARK);
}

function drawField(doc: PDFKit.PDFDocument, label: string, value: string, x = 50, wide = false) {
  const width = wide ? doc.page.width - 100 : (doc.page.width - 120) / 2;
  const currentY = doc.y;
  doc.fontSize(8).fillColor(STB_GRAY).font('Helvetica').text(label.toUpperCase(), x, currentY);
  doc.fontSize(11).fillColor(STB_DARK).font('Helvetica-Bold').text(value || '—', x, currentY + 12);
  if (!wide) {
    doc.y = currentY + 32;
  } else {
    doc.moveDown(0.5);
  }
}

function drawTwoFields(doc: PDFKit.PDFDocument, label1: string, val1: string, label2: string, val2: string) {
  const col1X = 50;
  const col2X = doc.page.width / 2 + 10;
  const startY = doc.y;
  doc.fontSize(8).fillColor(STB_GRAY).font('Helvetica').text(label1.toUpperCase(), col1X, startY);
  doc.fontSize(11).fillColor(STB_DARK).font('Helvetica-Bold').text(val1 || '—', col1X, startY + 12);
  doc.fontSize(8).fillColor(STB_GRAY).font('Helvetica').text(label2.toUpperCase(), col2X, startY);
  doc.fontSize(11).fillColor(STB_DARK).font('Helvetica-Bold').text(val2 || '—', col2X, startY + 12);
  doc.y = startY + 38;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(EmployeeDocument.name) private documentModel: Model<DocumentDocument>,
    @InjectModel('Employee') private employeeModel: Model<EmployeeDoc>,
  ) {}

  // ─────────────────────────────────────────────
  //  PDF GENERATORS
  // ─────────────────────────────────────────────

  private async generateContratCDI(emp: any): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const dateEmb = emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
    const dateNow = new Date().toLocaleDateString('fr-FR');

    drawSTBHeader(doc, 'Contrat de Travail à Durée Indéterminée', `Référence: CDI-${emp.matricule}-${new Date().getFullYear()}`);

    drawSection(doc, '1. Parties au Contrat');
    drawTwoFields(doc, 'Employeur', 'Société Tunisienne de Banque (STB)', 'Siège Social', 'Rue Hédi Nouira, Tunis 1001');
    drawTwoFields(doc, 'Matricule Fiscal', '123456A/M/000', 'RIB', 'STB — Agence Centrale');
    drawSection(doc, '2. Identité du Salarié');
    drawTwoFields(doc, 'Nom & Prénom', `${emp.prenom} ${emp.nom}`, 'Matricule', emp.matricule);
    drawTwoFields(doc, 'CIN', emp.cin || '—', 'Date de Naissance', emp.dateNaissance ? new Date(emp.dateNaissance).toLocaleDateString('fr-FR') : '—');
    drawTwoFields(doc, 'Email', emp.email, 'Téléphone', emp.phone || '—');
    drawTwoFields(doc, 'Adresse', emp.address || 'Non renseignée', 'Ville', emp.city || '—');
    drawSection(doc, '3. Conditions de Travail');
    drawTwoFields(doc, 'Poste', emp.poste || 'Collaborateur', 'Type de Contrat', 'CDI — Contrat à Durée Indéterminée');
    drawTwoFields(doc, 'Date d\'Embauche', dateEmb, "Horaire de Travail", emp.workSchedule || '8h00 - 17h00 (du Lundi au Vendredi)');
    drawTwoFields(doc, 'Salaire de Base', `${(emp.salaireBase || 1200).toLocaleString('fr-FR')} TND/mois`, 'Congés Annuels', `${emp.soldeConges || 30} jours ouvrables`);
    drawSection(doc, '4. Dispositions Légales');
    doc.fontSize(9).fillColor(STB_DARK).font('Helvetica')
      .text('Le présent contrat est soumis aux dispositions du Code du Travail tunisien (Loi n° 66-27 du 30 avril 1966) et à la Convention Collective Nationale du secteur bancaire. Les deux parties s\'engagent à respecter mutuellement les droits et obligations inhérents à la relation de travail.', 50, doc.y, { width: doc.page.width - 100, align: 'justify' });
    doc.moveDown(1);
    drawSection(doc, '5. Signatures');
    const sigY = doc.y + 10;
    doc.fontSize(9).fillColor(STB_GRAY).font('Helvetica').text('Le Salarié', 70, sigY).text('Pour STB Bank — La Direction RH', doc.page.width - 220, sigY);
    doc.moveTo(50, sigY + 50).lineTo(200, sigY + 50).strokeColor(STB_BLUE).stroke();
    doc.moveTo(doc.page.width - 230, sigY + 50).lineTo(doc.page.width - 50, sigY + 50).strokeColor(STB_BLUE).stroke();
    doc.fontSize(8).fillColor(STB_GRAY).text(`Fait à Tunis, le ${dateNow}`, 50, sigY + 60, { align: 'center', width: doc.page.width - 100 });
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  private async generateAttestationTravail(emp: any): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const dateNow = new Date().toLocaleDateString('fr-FR');
    const dateEmb = emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : dateNow;

    drawSTBHeader(doc, 'Attestation de Travail', `Ref: ATT-${emp.matricule}-${new Date().getFullYear()}`);

    doc.moveDown(1);
    doc.fontSize(13).fillColor(STB_BLUE).font('Helvetica-Bold').text('ATTESTATION DE TRAVAIL', { align: 'center' });
    drawSeparator(doc, doc.y + 8);
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica')
      .text('Je soussigné(e), Directeur des Ressources Humaines de la ', { continued: true })
      .font('Helvetica-Bold').text('Société Tunisienne de Banque (STB)', { continued: true })
      .font('Helvetica').text(', atteste par la présente que :');
    doc.moveDown(1);

    // Employee box
    doc.rect(50, doc.y, doc.page.width - 100, 100).fill(STB_LIGHT_GRAY).stroke();
    const boxY = doc.y + 12;
    drawTwoFields(doc, 'Nom & Prénom', `${emp.prenom} ${emp.nom}`, 'Matricule', emp.matricule);
    doc.y = boxY;
    drawTwoFields(doc, 'CIN', emp.cin || '—', 'Date de Naissance', emp.dateNaissance ? new Date(emp.dateNaissance).toLocaleDateString('fr-FR') : '—');
    drawTwoFields(doc, 'Poste', emp.poste || 'Collaborateur', 'Type de Contrat', emp.contractType || 'CDI');
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica')
      .text(`est employé(e) au sein de notre établissement depuis le `, { continued: true })
      .font('Helvetica-Bold').text(dateEmb, { continued: true })
      .font('Helvetica').text(`, en qualité de `, { continued: true })
      .font('Helvetica-Bold').text(`${emp.poste || 'Collaborateur'}`, { continued: true })
      .font('Helvetica').text(`.`);
    doc.moveDown(1);

    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica')
      .text(`Cette attestation est délivrée à l'intéressé(e) sur sa demande et pour faire valoir ce que de droit.`);
    doc.moveDown(2);

    drawSeparator(doc);
    const sigY = doc.y + 10;
    doc.fontSize(10).fillColor(STB_GRAY).font('Helvetica').text(`Fait à Tunis, le ${dateNow}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(STB_BLUE).font('Helvetica-Bold').text('Le Directeur des Ressources Humaines', { align: 'right' });
    doc.fontSize(9).fillColor(STB_GRAY).font('Helvetica').text('STB Bank — Direction Générale', { align: 'right' });
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  private async generateAttestationSalaire(emp: any): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const dateNow = new Date().toLocaleDateString('fr-FR');
    const salaire = emp.salaireBase || 1200;
    const cnss = Math.round(salaire * 0.0918);
    const irpp = Math.round((salaire - cnss) * 0.15);
    const net = salaire - cnss - irpp;

    drawSTBHeader(doc, 'Attestation de Salaire', `Ref: SAL-${emp.matricule}-${new Date().getFullYear()}`);
    doc.moveDown(1);
    doc.fontSize(13).fillColor(STB_BLUE).font('Helvetica-Bold').text('ATTESTATION DE SALAIRE', { align: 'center' });
    drawSeparator(doc, doc.y + 8);
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica')
      .text('La Société Tunisienne de Banque (STB) atteste que ').font('Helvetica-Bold')
      .text(`${emp.prenom} ${emp.nom}`, { continued: true }).font('Helvetica')
      .text(`, titulaire du CIN ${emp.cin || '—'}, Matricule ${emp.matricule}, `)
      .text(`perçoit à ce titre une rémunération mensuelle dont le détail est le suivant :`);
    doc.moveDown(0.5);

    drawSection(doc, 'Détail de la Rémunération');
    // Salary table
    const tableX = 50;
    const tableW = doc.page.width - 100;
    const rowH = 28;
    const rows = [
      ['Salaire Brut de Base', `${salaire.toLocaleString('fr-FR')} TND`],
      ['Cotisation CNSS (9.18%)', `- ${cnss.toLocaleString('fr-FR')} TND`],
      ['Retenue IRPP (15%)', `- ${irpp.toLocaleString('fr-FR')} TND`],
    ];
    let tableY = doc.y;
    // Header
    doc.rect(tableX, tableY, tableW, rowH).fill(STB_BLUE);
    doc.fontSize(9).fillColor(STB_WHITE).font('Helvetica-Bold')
      .text('RUBRIQUE', tableX + 10, tableY + 9)
      .text('MONTANT', tableX + tableW - 100, tableY + 9);
    tableY += rowH;

    rows.forEach((row, i) => {
      doc.rect(tableX, tableY, tableW, rowH).fill(i % 2 === 0 ? STB_LIGHT_GRAY : STB_WHITE);
      doc.fontSize(10).fillColor(STB_DARK).font('Helvetica')
        .text(row[0], tableX + 10, tableY + 8)
        .text(row[1], tableX + tableW - 110, tableY + 8);
      tableY += rowH;
    });

    // Net salary (highlighted)
    doc.rect(tableX, tableY, tableW, rowH + 4).fill(STB_GOLD);
    doc.fontSize(12).fillColor(STB_WHITE).font('Helvetica-Bold')
      .text('SALAIRE NET MENSUEL', tableX + 10, tableY + 9)
      .text(`${net.toLocaleString('fr-FR')} TND`, tableX + tableW - 130, tableY + 9);
    doc.y = tableY + rowH + 18;

    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica')
      .text('Cette attestation est délivrée à la demande de l\'intéressé(e) pour toute utilisation légale.');
    doc.moveDown(2);
    doc.fontSize(10).fillColor(STB_GRAY).font('Helvetica').text(`Fait à Tunis, le ${dateNow}`, { align: 'right' });
    doc.fontSize(10).fillColor(STB_BLUE).font('Helvetica-Bold').text('Le Directeur RH — STB Bank', { align: 'right' });
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  private async generateFichePaie(emp: any, month: number, year: number): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long' });
    const salaire = emp.salaireBase || 1200;
    const prime = emp.prime || 0;
    const brut = salaire + prime;
    const cnss = Math.round(brut * 0.0918);
    const irpp = Math.round((brut - cnss) * 0.15);
    const net = brut - cnss - irpp;

    drawSTBHeader(doc, 'Bulletin de Paie', `${monthName.toUpperCase()} ${year} — ${emp.matricule}`);
    doc.moveDown(0.5);

    drawSection(doc, 'Informations Employé');
    drawTwoFields(doc, 'Nom & Prénom', `${emp.prenom} ${emp.nom}`, 'Matricule', emp.matricule);
    drawTwoFields(doc, 'Poste', emp.poste || 'Collaborateur', 'Type de Contrat', emp.contractType || 'CDI');
    drawTwoFields(doc, 'RIB', emp.bankRib || '—', 'Banque', emp.bankName || 'STB');
    drawTwoFields(doc, 'Période', `${monthName} ${year}`, 'Jours Travaillés', '22 jours');

    drawSection(doc, 'Éléments de Rémunération');
    // Table
    const tableX = 50;
    const tableW = doc.page.width - 100;
    const rowH = 26;
    let tableY = doc.y;

    const headers = ['CODE', 'LIBELLÉ', 'BRUT', 'RETENUE', 'NET'];
    const colW = [60, 200, 80, 80, 80];
    let cx = tableX;

    // Header
    doc.rect(tableX, tableY, tableW, rowH).fill(STB_BLUE);
    headers.forEach((h, i) => {
      doc.fontSize(8.5).fillColor(STB_WHITE).font('Helvetica-Bold').text(h, cx + 4, tableY + 8, { width: colW[i] - 8 });
      cx += colW[i];
    });
    tableY += rowH;

    const rows: [string, string, string, string, string][] = [
      ['100', 'Salaire de Base', `${salaire.toLocaleString('fr-FR')} TND`, '', `${salaire.toLocaleString('fr-FR')} TND`],
      ['200', 'Prime / Avantages', prime > 0 ? `${prime.toLocaleString('fr-FR')} TND` : '0 TND', '', prime > 0 ? `${prime.toLocaleString('fr-FR')} TND` : '0 TND'],
      ['300', 'Cotisation CNSS (9.18%)', '', `${cnss.toLocaleString('fr-FR')} TND`, `-${cnss.toLocaleString('fr-FR')} TND`],
      ['400', 'Retenue IRPP (15%)', '', `${irpp.toLocaleString('fr-FR')} TND`, `-${irpp.toLocaleString('fr-FR')} TND`],
    ];

    rows.forEach((row, ri) => {
      doc.rect(tableX, tableY, tableW, rowH).fill(ri % 2 === 0 ? STB_LIGHT_GRAY : STB_WHITE);
      cx = tableX;
      row.forEach((cell, ci) => {
        doc.fontSize(9).fillColor(STB_DARK).font(ci === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .text(cell, cx + 4, tableY + 8, { width: colW[ci] - 8 });
        cx += colW[ci];
      });
      tableY += rowH;
    });

    // Net
    doc.rect(tableX, tableY, tableW, rowH + 6).fill(STB_GOLD);
    doc.fontSize(11).fillColor(STB_WHITE).font('Helvetica-Bold')
      .text('NET À PAYER', tableX + 10, tableY + 10)
      .text(`${net.toLocaleString('fr-FR')} TND`, tableX + tableW - 110, tableY + 10);
    doc.y = tableY + rowH + 20;

    drawSection(doc, 'Récapitulatif');
    drawTwoFields(doc, 'Salaire Brut', `${brut.toLocaleString('fr-FR')} TND`, 'Total Retenues', `${(cnss + irpp).toLocaleString('fr-FR')} TND`);
    drawTwoFields(doc, 'Net Imposable', `${(brut - cnss).toLocaleString('fr-FR')} TND`, 'Net à Payer', `${net.toLocaleString('fr-FR')} TND`);
    drawTwoFields(doc, 'Solde Congés', `${emp.soldeConges || 30} jours`, 'Date de Paiement', `01/${String(month).padStart(2, '0')}/${year}`);

    doc.moveDown(0.5);
    doc.fontSize(8).fillColor(STB_GRAY).font('Helvetica')
      .text('Ce bulletin de paie est généré automatiquement par le système RH STB. Conservez-le précieusement.', { align: 'center' });
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  private async generateContratCredit(emp: any, additionalData: Record<string, string> = {}): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const dateNow = new Date().toLocaleDateString('fr-FR');
    const montant = additionalData.montant || '10 000';
    const duree = additionalData.duree || '24';
    const taux = additionalData.taux || '8.5';
    const mensualite = additionalData.mensualite || '—';

    drawSTBHeader(doc, 'Contrat de Crédit', `Ref: CRD-${emp.matricule}-${new Date().getFullYear()}`);
    doc.moveDown(1);
    doc.fontSize(13).fillColor(STB_BLUE).font('Helvetica-Bold').text('CONTRAT DE CRÉDIT SALARIÉ', { align: 'center' });
    drawSeparator(doc, doc.y + 8);
    doc.moveDown(0.5);

    drawSection(doc, 'Informations de l\'Emprunteur');
    drawTwoFields(doc, 'Nom & Prénom', `${emp.prenom} ${emp.nom}`, 'Matricule', emp.matricule);
    drawTwoFields(doc, 'CIN', emp.cin || '—', 'Poste', emp.poste || 'Collaborateur');

    drawSection(doc, 'Conditions du Crédit');
    drawTwoFields(doc, 'Montant du Crédit', `${montant} TND`, 'Durée', `${duree} mois`);
    drawTwoFields(doc, 'Taux d\'Intérêt Annuel', `${taux}%`, 'Mensualité Estimée', `${mensualite} TND`);
    drawTwoFields(doc, 'Date d\'Accord', dateNow, 'Premier Remboursement', 'Le 1er du mois suivant');

    drawSection(doc, 'Conditions Particulières');
    doc.fontSize(10).fillColor(STB_DARK).font('Helvetica')
      .text('• Le crédit est accordé exclusivement pour usage personnel du salarié.\n• Le remboursement s\'effectue par prélèvement mensuel sur le salaire.\n• En cas de rupture du contrat de travail, le solde restant devient immédiatement exigible.\n• Les intérêts sont calculés sur le capital restant dû.', { lineGap: 4 });

    doc.moveDown(2);
    const sigY = doc.y;
    doc.fontSize(9).fillColor(STB_GRAY).text('Le Salarié', 70, sigY).text('La Direction STB Bank', doc.page.width - 190, sigY);
    doc.moveTo(50, sigY + 45).lineTo(200, sigY + 45).strokeColor(STB_BLUE).stroke();
    doc.moveTo(doc.page.width - 210, sigY + 45).lineTo(doc.page.width - 50, sigY + 45).strokeColor(STB_BLUE).stroke();
    doc.fontSize(8).fillColor(STB_GRAY).text(`Fait à Tunis en deux exemplaires, le ${dateNow}`, 50, sigY + 55, { align: 'center', width: doc.page.width - 100 });
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  private async generateBadge(emp: any): Promise<string> {
    const doc = new PDFDocument({ margin: 0, size: [300, 480] });
    
    // Premium Gradient Background
    const bgGrad = doc.linearGradient(0, 0, 300, 480);
    bgGrad.stop(0, '#061334').stop(1, '#0f2762');
    doc.rect(0, 0, 300, 480).fill(bgGrad);
    
    // Top & Bottom Gold Stripes
    doc.rect(0, 0, 300, 10).fill(STB_GOLD);
    doc.rect(0, 470, 300, 10).fill(STB_GOLD);
    
    // Decorative subtle circles
    doc.circle(0, 0, 120).lineWidth(2).strokeOpacity(0.05).strokeColor('#FFFFFF').stroke();
    doc.circle(300, 480, 180).lineWidth(2).strokeOpacity(0.05).strokeColor('#FFFFFF').stroke();

    // Header
    doc.fontSize(8).fillColor('#93C5FD').font('Helvetica-Oblique').text('SOCIÉTÉ TUNISIENNE DE BANQUE', 15, 25, { align: 'center', width: 270 });
    
    try {
      const logoPath = '/Users/mohamedyassineouertani/Downloads/stb_mobile/public/logo for splash.png';
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 130, 38, { width: 40 });
      } else {
        doc.fontSize(14).fillColor(STB_WHITE).font('Helvetica-Bold').text('STB BANK', 15, 45, { align: 'center', width: 270 });
      }
    } catch (e) {
      doc.fontSize(14).fillColor(STB_WHITE).font('Helvetica-Bold').text('STB BANK', 15, 45, { align: 'center', width: 270 });
    }

    // Avatar Circle with Glow Effect (simulated with multiple circles)
    doc.circle(150, 135, 60).fillOpacity(0.1).fill(STB_WHITE);
    doc.circle(150, 135, 55).fillOpacity(1).fill('#1565C0').strokeColor(STB_GOLD).lineWidth(2).stroke();
    const initials = `${(emp.prenom || 'E')[0]}${(emp.nom || 'X')[0]}`.toUpperCase();
    doc.fontSize(32).fillColor(STB_WHITE).font('Helvetica-Bold').text(initials, 110, 115, { align: 'center', width: 80 });

    // Badge Number Chip
    doc.roundedRect(100, 195, 100, 22, 11).fill(STB_GOLD);
    doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold').text(emp.matricule, 100, 201, { width: 100, align: 'center' });

    // Name & Role
    doc.fontSize(19).fillColor(STB_WHITE).font('Helvetica-Bold').text(`${emp.prenom} ${emp.nom}`, 15, 230, { align: 'center', width: 270 });
    doc.fontSize(11).fillColor('#93C5FD').font('Helvetica').text((emp.poste || 'Collaborateur').toUpperCase(), 15, 255, { align: 'center', width: 270 });

    // Separator line
    doc.moveTo(40, 280).lineTo(260, 280).strokeColor(STB_GOLD).lineWidth(1).strokeOpacity(0.5).stroke();

    // Details info
    const infoItems = [
      { label: 'CIN', value: emp.cin || '—' },
      { label: 'EMAIL', value: emp.email || '—' },
      { label: 'TÉL.', value: emp.phone || '—' },
      { label: 'EMBAUCHE', value: emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : '—' },
    ];
    let infoY = 295;
    infoItems.forEach(item => {
      doc.fontSize(8).fillColor('#93C5FD').font('Helvetica').text(item.label + ':', 35, infoY);
      doc.fontSize(9).fillColor(STB_WHITE).font('Helvetica-Bold').text(item.value, 110, infoY, { width: 155, align: 'left' });
      infoY += 24;
    });

    // QR Code Area
    doc.roundedRect(100, 395, 100, 60, 6).fillOpacity(1).fill('#1565C0');
    doc.fontSize(9).fillColor(STB_WHITE).font('Helvetica-Bold').text('QR CODE', 100, 410, { width: 100, align: 'center' });
    doc.fontSize(7).fillColor(STB_GOLD).text(`STB-${emp.matricule}`, 100, 425, { width: 100, align: 'center' });

    // Footer text
    doc.fontSize(7).fillColor('#93C5FD').font('Helvetica').text('www.stb.com.tn  •  En Service STB', 15, 460, { align: 'center', width: 270 });
    return streamToBase64(doc);
  }

  private async generateGenericDocument(emp: any, title: string, refType: string, customText: string): Promise<string> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const dateNow = new Date().toLocaleDateString('fr-FR');
    drawSTBHeader(doc, title, `Ref: ${refType}-${emp.matricule}-${new Date().getFullYear()}`);
    doc.moveDown(1);
    doc.fontSize(14).fillColor(STB_BLUE).font('Helvetica-Bold').text(title.toUpperCase(), { align: 'center' });
    drawSeparator(doc, doc.y + 10);
    doc.moveDown(1);

    drawSection(doc, 'Informations Collaborateur');
    drawTwoFields(doc, 'Nom & Prénom', `${emp.prenom} ${emp.nom}`, 'Matricule', emp.matricule);
    drawTwoFields(doc, 'Poste', emp.poste || 'Collaborateur', 'CIN', emp.cin || '—');

    drawSection(doc, 'Détails du Document');
    doc.fontSize(11).fillColor(STB_DARK).font('Helvetica').text(customText, { lineGap: 6, align: 'justify' });
    
    doc.moveDown(3);
    const sigY = doc.y;
    doc.fontSize(10).fillColor(STB_GRAY).text('La Direction STB Bank', doc.page.width - 200, sigY, { align: 'center' });
    doc.moveTo(doc.page.width - 220, sigY + 60).lineTo(doc.page.width - 50, sigY + 60).strokeColor(STB_BLUE).stroke();
    doc.fontSize(9).fillColor(STB_GRAY).text(`Fait à Tunis, le ${dateNow}`, 50, sigY + 75, { align: 'center', width: doc.page.width - 100 });
    
    drawSTBFooter(doc);
    return streamToBase64(doc);
  }

  // ─────────────────────────────────────────────
  //  MAIN GENERATE METHOD
  // ─────────────────────────────────────────────

  async generateDocument(employeeId: string, documentType: string, additionalData: Record<string, string> = {}) {
    const employee = await this.employeeModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employé non trouvé');

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthName = now.toLocaleString('fr-FR', { month: 'long' });

    const typeUpper = documentType.toUpperCase();
    let fileBase64: string;
    let title: string;
    let fileName: string;
    let docType: DocumentType;

    switch (typeUpper) {
      case 'CONTRAT_CDI':
      case 'CONTRACT':
        fileBase64 = await this.generateContratCDI(employee);
        title = `Contrat CDI — ${employee.prenom} ${employee.nom}`;
        fileName = `contrat_cdi_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.CONTRACT;
        break;
      case 'ATTESTATION_TRAVAIL':
      case 'WORK_CERTIFICATE':
      case 'ATTESTATION':
        fileBase64 = await this.generateAttestationTravail(employee);
        title = `Attestation de Travail — ${employee.prenom} ${employee.nom} — ${year}`;
        fileName = `attestation_travail_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.WORK_CERTIFICATE;
        break;
      case 'ATTESTATION_SALAIRE':
      case 'SALARY_CERTIFICATE':
        fileBase64 = await this.generateAttestationSalaire(employee);
        title = `Attestation de Salaire — ${employee.prenom} ${employee.nom} — ${year}`;
        fileName = `attestation_salaire_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.SALARY_CERTIFICATE;
        break;
      case 'FICHE_PAIE':
      case 'PAYSLIP':
        fileBase64 = await this.generateFichePaie(employee, month, year);
        title = `Fiche de Paie — ${monthName} ${year} — ${employee.prenom} ${employee.nom}`;
        fileName = `fiche_paie_${employee.matricule}_${year}_${String(month).padStart(2, '0')}.pdf`;
        docType = DocumentType.PAYSLIP;
        break;
      case 'CONTRAT_CREDIT':
        fileBase64 = await this.generateContratCredit(employee, additionalData);
        title = `Contrat de Crédit — ${employee.prenom} ${employee.nom} — ${year}`;
        fileName = `contrat_credit_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.CONTRACT;
        break;
      case 'BADGE':
      case 'ID_DOCUMENT':
        fileBase64 = await this.generateBadge(employee);
        title = `Badge Numérique — ${employee.prenom} ${employee.nom}`;
        fileName = `badge_${employee.matricule}.pdf`;
        docType = DocumentType.ID_DOCUMENT;
        break;
      case 'CONTRAT_CDD':
        fileBase64 = await this.generateGenericDocument(employee, 'Contrat à Durée Déterminée', 'CDD', `Le présent contrat à durée déterminée engage la Société Tunisienne de Banque et M./Mme ${employee.prenom} ${employee.nom} pour une durée déterminée, selon la législation tunisienne en vigueur.`);
        title = `Contrat CDD — ${employee.prenom} ${employee.nom}`;
        fileName = `contrat_cdd_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.CONTRACT;
        break;
      case 'ATTESTATION_EMBAUCHE':
        fileBase64 = await this.generateGenericDocument(employee, 'Attestation d\'Embauche', 'EMB', `Nous soussignés, la Société Tunisienne de Banque (STB), attestons que M./Mme ${employee.prenom} ${employee.nom} est embauché(e) au sein de notre institution depuis le ${employee.dateEmbauche ? new Date(employee.dateEmbauche).toLocaleDateString('fr-FR') : now.toLocaleDateString('fr-FR')}.`);
        title = `Attestation d'Embauche — ${employee.prenom} ${employee.nom}`;
        fileName = `attestation_embauche_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.WORK_CERTIFICATE;
        break;
      case 'AUTORISATION_CONGE':
        fileBase64 = await this.generateGenericDocument(employee, 'Autorisation de Congé', 'CNG', `La Direction RH de la STB accorde par la présente une autorisation de congé à M./Mme ${employee.prenom} ${employee.nom} selon le calendrier défini et validé par son manager direct.`);
        title = `Autorisation Congé — ${employee.prenom} ${employee.nom}`;
        fileName = `autorisation_conge_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.OTHER;
        break;
      case 'DECISION_PRIME':
        fileBase64 = await this.generateGenericDocument(employee, 'Décision d\'Attribution de Prime', 'PRM', `Par décision de la Direction Générale de la STB, une prime de mérite est accordée à M./Mme ${employee.prenom} ${employee.nom} en reconnaissance de son implication et de ses résultats exceptionnels.`);
        title = `Décision Prime — ${employee.prenom} ${employee.nom}`;
        fileName = `decision_prime_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.OTHER;
        break;
      case 'DECISION_PROMOTION':
        fileBase64 = await this.generateGenericDocument(employee, 'Décision de Promotion', 'PRO', `La Direction Générale est heureuse d'annoncer la promotion de M./Mme ${employee.prenom} ${employee.nom} au vu de son ancienneté et de la qualité de son travail.`);
        title = `Décision Promotion — ${employee.prenom} ${employee.nom}`;
        fileName = `decision_promotion_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.OTHER;
        break;
      case 'DECISION_MUTATION':
        fileBase64 = await this.generateGenericDocument(employee, 'Décision de Mutation', 'MUT', `M./Mme ${employee.prenom} ${employee.nom} est muté(e) vers un nouveau département/agence au sein de la STB, dans le cadre de la mobilité interne et du développement des compétences.`);
        title = `Décision Mutation — ${employee.prenom} ${employee.nom}`;
        fileName = `decision_mutation_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.OTHER;
        break;
      case 'AVENANT_CONTRAT':
        fileBase64 = await this.generateGenericDocument(employee, 'Avenant au Contrat de Travail', 'AVE', `Le présent document constitue un avenant au contrat de travail initial de M./Mme ${employee.prenom} ${employee.nom}, modifiant certaines clauses conformément aux récents accords entre les parties.`);
        title = `Avenant Contrat — ${employee.prenom} ${employee.nom}`;
        fileName = `avenant_contrat_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.CONTRACT;
        break;
      case 'TAX_DECLARATION':
        fileBase64 = await this.generateGenericDocument(employee, 'Déclaration Fiscale (Retenue à la source)', 'FIS', `Document justifiant la retenue à la source effectuée sur les revenus de M./Mme ${employee.prenom} ${employee.nom} au profit du Trésor Public Tunisien pour l'exercice fiscal en cours.`);
        title = `Déclaration Fiscale — ${employee.prenom} ${employee.nom}`;
        fileName = `declaration_fiscale_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.TAX_DECLARATION;
        break;
      case 'CNSS_DECLARATION':
        fileBase64 = await this.generateGenericDocument(employee, 'Déclaration CNSS', 'CNS', `Attestation de déclaration et de versement des cotisations sociales à la CNSS pour M./Mme ${employee.prenom} ${employee.nom}.`);
        title = `Déclaration CNSS — ${employee.prenom} ${employee.nom}`;
        fileName = `declaration_cnss_${employee.matricule}_${year}.pdf`;
        docType = DocumentType.CNSS_DECLARATION;
        break;
      default:
        throw new BadRequestException(`Type de document non supporté: ${documentType}`);
    }

    const existing = await this.documentModel.findOne({ employeeId: new Types.ObjectId(employeeId), type: docType, year, month: typeUpper === 'FICHE_PAIE' || typeUpper === 'PAYSLIP' ? month : undefined });
    if (existing) {
      // Update the existing doc
      existing.fileUrl = fileBase64;
      existing.title = title;
      // Use set to trigger timestamps update if needed, but save() will do it
      // existing.updatedAt = now as any;
      await existing.save();
      return existing;
    }

    const savedDoc = await this.documentModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: docType,
      title,
      fileName,
      fileSize: Math.round(fileBase64.length * 0.75),
      fileUrl: fileBase64,
      mimeType: 'application/pdf',
      description: `Document généré automatiquement par STB RH Système`,
      isRead: false,
      year,
      month: typeUpper === 'FICHE_PAIE' || typeUpper === 'PAYSLIP' ? month : undefined,
      generated: true,
    } as any);

    return savedDoc;
  }

  // ─────────────────────────────────────────────
  //  AUTO GENERATE ON EMPLOYEE CREATION
  // ─────────────────────────────────────────────

  @OnEvent('employee.created')
  async handleEmployeeCreatedEvent(payload: { employeeId: string; employee: any }) {
    console.log(`🏦 STB: Auto-génération des documents d'embauche pour l'employé ${payload.employeeId}...`);
    await this.autoGenerateOnboardingDocuments(payload.employeeId);
    console.log(`✅ Documents générés avec succès pour ${payload.employeeId}`);
  }

  async autoGenerateOnboardingDocuments(employeeId: string) {
    const types = [
      'CONTRAT_CDI', 'ATTESTATION_TRAVAIL', 'ATTESTATION_SALAIRE', 
      'BADGE', 'FICHE_PAIE', 'ATTESTATION_EMBAUCHE', 'AUTORISATION_CONGE', 
      'DECISION_PRIME', 'DECISION_PROMOTION', 'CONTRAT_CREDIT', 
      'TAX_DECLARATION', 'CNSS_DECLARATION'
    ];
    const results: any[] = [];
    for (const type of types) {
      try {
        const doc = await this.generateDocument(employeeId, type);
        results.push({ type, success: true, docId: doc._id });
      } catch (err: any) {
        results.push({ type, success: false, error: err.message });
      }
    }
    return results;
  }

  // ─────────────────────────────────────────────
  //  MONTHLY CRON: Auto-generate payslips
  // ─────────────────────────────────────────────

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyPayslips() {
    console.log('🏦 STB: Auto-génération des fiches de paie mensuelles...');
    const employees = await this.employeeModel.find({ status: EmployeeStatus.ACTIVE }).exec();
    let count = 0;
    for (const emp of employees) {
      try {
        await this.generateDocument(emp._id.toString(), 'FICHE_PAIE');
        count++;
      } catch (err) {
        console.error(`Erreur fiche de paie pour ${emp.matricule}:`, err);
      }
    }
    console.log(`✅ ${count} fiches de paie générées pour ${new Date().toLocaleString('fr-FR', { month: 'long' })}`);
  }

  // ─────────────────────────────────────────────
  //  CRUD
  // ─────────────────────────────────────────────

  async create(data: Partial<EmployeeDocument>) {
    const doc = await this.documentModel.create(data);
    return doc;
  }

  async findByEmployee(employeeId: string, year?: number) {
    const filter: any = { employeeId: new Types.ObjectId(employeeId), isActive: true };
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
    const doc = await this.documentModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, data: Partial<EmployeeDocument>) {
    const doc = await this.documentModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.documentModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    if (!doc) throw new NotFoundException('Document not found');
    return { success: true };
  }

  async getStats(employeeId: string) {
    const docs = await this.documentModel.find({ employeeId: new Types.ObjectId(employeeId), isActive: true }).exec();
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