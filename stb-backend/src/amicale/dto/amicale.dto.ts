import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmicaleOfferDto {
  @ApiProperty({ example: 'Paris 5 Jours', description: 'Titre principal de l\'offre' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Escapade romantique', description: 'Sous-titre ou lieu' })
  @IsString()
  @IsNotEmpty()
  sub: string;

  @ApiProperty({ example: 'Voyages', description: 'Catégorie (Voyages, Hôtels, Bien-être, Achats)' })
  @IsString()
  @IsNotEmpty()
  cat: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,...', description: 'Image base64 ou URL' })
  @IsString()
  @IsNotEmpty()
  img: string;

  @ApiProperty({ example: '1250 TND', description: 'Tarif STB (texte libre)' })
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty({ example: '#7C3AED', description: 'Couleur du badge (HEX)' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 'Profitez d\'un séjour inoubliable à Paris...', description: 'Description complète' })
  @IsString()
  @IsNotEmpty()
  desc: string;
}

export class UpdateAmicaleOfferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sub?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  img?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
