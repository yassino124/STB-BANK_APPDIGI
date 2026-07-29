import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('HR Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new HR request (Conge, Avance, Document, Carte)' })
  create(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, createRequestDto);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get all requests for the logged-in employee' })
  findMine(@Request() req) {
    return this.requestsService.findAllByEmployee(req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests (Admin/HR only in production)' })
  findAll() {
    return this.requestsService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve, Refuse or Cancel a request' })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateRequestStatusDto) {
    return this.requestsService.updateStatus(id, updateDto);
  }
}
