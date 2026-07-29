import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRate } from './schemas/exchange-rate.schema';

@ApiTags('💱 Exchange Rates')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create exchange rate' })
  create(@Body() data: Partial<ExchangeRate>) {
    return this.exchangeRatesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all exchange rates' })
  findAll() {
    return this.exchangeRatesService.findAll();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest exchange rate' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  findLatest(@Query('from') from: string, @Query('to') to: string) {
    return this.exchangeRatesService.findLatest(from, to);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get exchange rate history' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findHistory(@Query('from') from: string, @Query('to') to: string, @Query('limit') limit = 30) {
    return this.exchangeRatesService.findHistory(from, to, +limit);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert currency' })
  @ApiQuery({ name: 'amount', required: true, type: Number })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  convert(@Query('amount') amount: number, @Query('from') from: string, @Query('to') to: string) {
    return this.exchangeRatesService.convert(amount, from, to);
  }
}
