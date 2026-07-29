import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { EmployeeDocument } from './schemas/document.schema';

@ApiTags('📄 Documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('generate/:employeeId')
  @ApiOperation({ summary: 'Generate document PDF for employee' })
  generate(
    @Param('employeeId') employeeId: string,
    @Body() data: { type: string },
  ) {
    return this.documentsService.generateDocument(employeeId, data.type);
  }

  @Post()
  @ApiOperation({ summary: 'Upload document for employee' })
  create(@Body() data: any) {
    return this.documentsService.create(data);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get employee documents' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return this.documentsService.findByEmployee(employeeId, year);
  }

  @Get('employee/:employeeId/stats')
  @ApiOperation({ summary: 'Get employee document stats' })
  getStats(@Param('employeeId') employeeId: string) {
    return this.documentsService.getStats(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark document as read' })
  markAsRead(@Param('id') id: string) {
    return this.documentsService.markAsRead(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  update(@Param('id') id: string, @Body() data: Partial<EmployeeDocument>) {
    return this.documentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
