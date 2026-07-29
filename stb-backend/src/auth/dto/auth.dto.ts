import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  Length,
  Matches,
  IsNumberString,
} from 'class-validator';

// ─── Activation ────────────────────────────────────────────────
export class ActivateRequestDto {
  @ApiProperty({ example: 'EMP001234', description: 'Matricule de l\'employé' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: '12345678', description: 'Numéro CIN' })
  @IsString()
  @IsNotEmpty()
  cin: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date de naissance (ISO)' })
  @IsDateString()
  dateNaissance: string;
}

// ─── OTP Verification ─────────────────────────────────────────
export class VerifyOtpDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: '482931', description: 'Code OTP 6 chiffres' })
  @IsNumberString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'ACTIVATION', enum: ['ACTIVATION', 'PASSWORD_RESET', 'DEVICE_CHANGE'] })
  @IsString()
  purpose: string;
}

// ─── Create Password ──────────────────────────────────────────
export class CreatePasswordDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: 'MyStr@ng2024!', description: 'Mot de passe (8+ chars, majuscule, chiffre, symbole)' })
  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole',
  })
  password: string;
}

// ─── Create PIN ───────────────────────────────────────────────
export class CreatePinDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: '458936', description: 'PIN 6 chiffres' })
  @IsNumberString()
  @Length(6, 6, { message: 'Le PIN doit contenir exactement 6 chiffres' })
  pin: string;
}

// ─── Login ────────────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'EMP001234', description: 'Matricule ou Employee ID' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: 'MyStr@ng2024!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, description: 'Device UUID for trusted device recognition' })
  @IsOptional()
  @IsString()
  deviceUUID?: string;

  @ApiProperty({ required: false, example: 'iPhone 16 Pro' })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ required: false, example: 'iOS', enum: ['iOS', 'Android', 'Web'] })
  @IsOptional()
  @IsString()
  platform?: string;
}

// ─── Biometric Login ──────────────────────────────────────────
export class BiometricLoginDto {
  @ApiProperty({ description: 'Device UUID of trusted device' })
  @IsString()
  @IsNotEmpty()
  deviceUUID: string;

  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ enum: ['FACE_ID', 'FINGERPRINT', 'PIN'], description: 'Type of biometric used' })
  @IsString()
  biometricType: string;
}

// ─── PIN Login ────────────────────────────────────────────────
export class PinLoginDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: '458936' })
  @IsNumberString()
  @Length(6, 6)
  pin: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceUUID?: string;
}

// ─── Refresh Token ────────────────────────────────────────────
export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// ─── Forgot Password ──────────────────────────────────────────
export class ForgotPasswordDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;
}

// ─── Reset Password ───────────────────────────────────────────
export class ResetPasswordDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty({ example: '482931' })
  @IsNumberString()
  @Length(6, 6)
  otpCode: string;

  @ApiProperty({ example: 'NewStr@ng2024!' })
  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un symbole',
  })
  newPassword: string;
}

// ─── Enable Biometrics ────────────────────────────────────────
export class EnableBiometricsDto {
  @ApiProperty({ enum: ['FACE_ID', 'FINGERPRINT', 'BOTH'] })
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  deviceUUID: string;
}

// ─── Change Device ────────────────────────────────────────────
export class ChangeDeviceDto {
  @ApiProperty({ example: 'EMP001234' })
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newDeviceUUID: string;

  @ApiProperty({ example: 'Samsung Galaxy S25' })
  @IsString()
  newDeviceName: string;

  @ApiProperty({ example: '482931' })
  @IsNumberString()
  @Length(6, 6)
  otpCode: string;
}
