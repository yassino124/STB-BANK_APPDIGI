import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { PrimesService } from './primes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Primes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('primes')
export class PrimesController {
  constructor(private readonly primesService: PrimesService) {}

  @Post()
  @ApiOperation({ summary: 'Request a prime' })
  create(@Request() req, @Body() dto: { type: string; montant: number; description: string }) {
    return this.primesService.create(req.user.sub, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'My primes' })
  getMine(@Request() req) {
    return this.primesService.getMyPrimes(req.user.sub);
  }

  @Get('all')
  @ApiOperation({ summary: 'All primes (RH)' })
  getAll() {
    return this.primesService.getAllPrimes();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Pending primes (RH)' })
  getPending() {
    return this.primesService.getAllPrimes('PENDING');
  }

  @Patch(':id/handle')
  @ApiOperation({ summary: 'Approve or reject prime (RH)' })
  handle(@Param('id') id: string, @Request() req, @Body() body: { decision: 'APPROVED' | 'REJECTED' }) {
    return this.primesService.handle(id, req.user.sub, body.decision);
  }
}
