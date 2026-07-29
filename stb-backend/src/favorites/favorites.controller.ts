import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { Favorite } from './schemas/favorite.schema';

@ApiTags('⭐ Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add favorite' })
  create(@Body() data: Partial<Favorite>) {
    return this.favoritesService.create(data.employeeId as unknown as string, data);
  }

  @Get()
  @ApiOperation({ summary: 'List favorites' })
  findByEmployee(@Query('employeeId') employeeId: string) {
    return this.favoritesService.findByEmployee(employeeId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'List favorites by type' })
  findByType(@Query('employeeId') employeeId: string, @Param('type') type: string) {
    return this.favoritesService.findByType(employeeId, type);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove favorite' })
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }
}
