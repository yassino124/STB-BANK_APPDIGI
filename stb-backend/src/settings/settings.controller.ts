import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';

@ApiTags('⚙️ Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create setting' })
  create(@Body() data: Partial<Setting>) {
    return this.settingsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all settings' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Update setting' })
  update(@Param('key') key: string, @Body('value') value: any) {
    return this.settingsService.update(key, value);
  }
}
