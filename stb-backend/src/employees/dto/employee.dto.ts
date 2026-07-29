import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { EmployeeStatus } from '../../common/enums/employee-status.enum';

export class CreateEmployeeDto {
  @ApiPropertyOptional({ example: 'EMP001234', description: 'Matricule (auto-generated if empty)' })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({ example: '12345678', description: 'Numéro CIN' })
  @IsString()
  @IsNotEmpty()
  cin: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  dateNaissance: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'Mohamed' })
  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ApiProperty({ example: 'ahmed.benali@stb.com.tn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+21698765432' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ enum: Role, isArray: true, default: [Role.EMPLOYEE] })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @ApiPropertyOptional({ example: 'Analyste Crédit' })
  @IsOptional()
  @IsString()
  poste?: string;

  @ApiPropertyOptional({ example: 'Direction des Risques' })
  @IsOptional()
  @IsString()
  departement?: string;

  @ApiPropertyOptional({ example: 'Agence Tunis Centre' })
  @IsOptional()
  @IsString()
  agence?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  soldeConges?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  creditsEnCours?: number;

  @ApiPropertyOptional({ example: 2500, description: 'Salaire de base en TND' })
  @IsOptional()
  @IsNumber()
  salaireBase?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Solde initial du compte (TND)' })
  @IsOptional()
  @IsNumber()
  compteSolde?: number;

  @ApiPropertyOptional({ example: 200, description: 'Prime mensuelle en TND' })
  @IsOptional()
  @IsNumber()
  prime?: number;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL de la photo de profil' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'ID du manager (N+1)' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012', description: 'ID du département' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439013', description: 'ID de l\'agence' })
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateEmployeeFinancialsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  soldeConges?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  creditsEnCours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  avancesEnCours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prime?: number;

  @ApiPropertyOptional({ example: 2500, description: 'Salaire de base en TND' })
  @IsOptional()
  @IsNumber()
  salaireBase?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Solde actuel du compte (TND)' })
  @IsOptional()
  @IsNumber()
  compteSolde?: number;
}

export class UpdateEmployeeRolesDto {
  @ApiProperty({ enum: Role, isArray: true })
  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}

export class UpdateEmployeeStatusDto {
  @ApiProperty({ enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}

export class UpdateEmployeeAvatarDto {
  @ApiProperty({ example: 'data:image/jpeg;base64,...', description: 'Base64 image string' })
  @IsString()
  @IsNotEmpty()
  avatar: string;
}
