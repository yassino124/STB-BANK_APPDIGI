import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { Currency } from './schemas/currency.schema';

@ApiTags('💱 Currencies')
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create currency' })
  create(@Body() data: Partial<Currency>) {
    return this.currenciesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all currencies' })
  findAll() {
    return this.currenciesService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default currencies' })
  seedDefaultCurrencies() {
    return this.currenciesService.seedDefaultCurrencies();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get currency by ID' })
  findOne(@Param('id') id: string) {
    return this.currenciesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get currency by code' })
  findByCode(@Param('code') code: string) {
    return this.currenciesService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update currency' })
  update(@Param('id') id: string, @Body() data: Partial<Currency>) {
    return this.currenciesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete currency' })
  remove(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }
}
