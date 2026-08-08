import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { EmployeeDocument } from './schemas/document.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('📄 Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ─── Generate a single document by type ─────────────────────────────────────
  @Post('generate/:employeeId')
  @ApiOperation({ summary: 'Generate branded PDF document for employee' })
  generate(
    @Param('employeeId') employeeId: string,
    @Body() data: { type: string; additionalData?: Record<string, string> },
  ) {
    return this.documentsService.generateDocument(employeeId, data.type, data.additionalData || {});
  }

  // ─── Generate (old route kept for compat) ────────────────────────────────────
  @Post('generate')
  @ApiOperation({ summary: 'Generate document from web UI (legacy route)' })
  generateLegacy(
    @Body() data: { employeeId: string; documentType: string; additionalData?: Record<string, string> },
  ) {
    return this.documentsService.generateDocument(data.employeeId, data.documentType, data.additionalData || {});
  }

  // ─── Auto-generate all onboarding docs (Contrat + Attestations + Badge) ──────
  @Post('onboarding/:employeeId')
  @ApiOperation({ summary: 'Auto-generate full onboarding document pack (CDI + Attestations + Badge)' })
  generateOnboarding(@Param('employeeId') employeeId: string) {
    return this.documentsService.autoGenerateOnboardingDocuments(employeeId);
  }

  // ─── Trigger monthly payslips manually ───────────────────────────────────────
  @Post('generate-payslips')
  @ApiOperation({ summary: 'Manually trigger monthly payslip generation for all active employees' })
  generateAllPayslips() {
    return this.documentsService.generateMonthlyPayslips();
  }

  // ─── Upload document ─────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Upload document for employee' })
  create(@Body() data: any) {
    return this.documentsService.create(data);
  }

  // ─── Get employee documents ───────────────────────────────────────────────────
  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get all documents for an employee' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.documentsService.findByEmployee(employeeId, year);
  }

  // ─── Get stats ────────────────────────────────────────────────────────────────
  @Get('employee/:employeeId/stats')
  @ApiOperation({ summary: 'Get document stats for an employee' })
  getStats(@Param('employeeId') employeeId: string) {
    return this.documentsService.getStats(employeeId);
  }

  // ─── Get my documents (authenticated employee) ────────────────────────────────
  @Get('my')
  @ApiOperation({ summary: 'Get all documents for logged-in employee' })
  async getMyDocuments(@Request() req) {
    // Extract user ID from JWT token
    const employeeId = req.user.sub;
    return this.documentsService.findByEmployee(employeeId);
  }

  // ─── Get single document ──────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────────
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark document as read' })
  markAsRead(@Param('id') id: string) {
    return this.documentsService.markAsRead(id);
  }

  // ─── Update ───────────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  update(@Param('id') id: string, @Body() data: Partial<EmployeeDocument>) {
    return this.documentsService.update(id, data);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Delete (soft) document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
