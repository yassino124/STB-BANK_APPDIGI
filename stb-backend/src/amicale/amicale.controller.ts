import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AmicaleService } from './amicale.service';
import { CreateAmicaleOfferDto, UpdateAmicaleOfferDto } from './dto/amicale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('amicale')
export class AmicaleController {
  constructor(private readonly service: AmicaleService) {}

  @Get('active')
  @UseGuards(JwtAuthGuard)
  findAllActive() {
    return this.service.findAllActive();
  }

  @Get(':id/image')
  // Public endpoint - no authentication required for images
  async getOfferImage(@Param('id') id: string, @Req() req: any) {
    const offer = await this.service.findOne(id);
    if (!offer || !offer.img) {
      throw new Error('Image not found');
    }

    // Handle base64 images
    if (offer.img.startsWith('data:image')) {
      const base64Data = offer.img.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      req.res.setHeader('Content-Type', 'image/jpeg');
      req.res.setHeader('Content-Length', buffer.length);
      req.res.setHeader('Cache-Control', 'public, max-age=86400');
      return buffer;
    }

    // If URL, redirect
    req.res.redirect(offer.img);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RH)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RH)
  create(@Body() dto: CreateAmicaleOfferDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RH)
  update(@Param('id') id: string, @Body() dto: UpdateAmicaleOfferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.RH)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
