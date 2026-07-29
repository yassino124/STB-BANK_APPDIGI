import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { EmployeesService } from '../employees/employees.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ActivateRequestDto,
  VerifyOtpDto,
  CreatePasswordDto,
  CreatePinDto,
  LoginDto,
  BiometricLoginDto,
  PinLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  EnableBiometricsDto,
  ChangeDeviceDto,
} from './dto/auth.dto';

@ApiTags('🔐 Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly employeesService: EmployeesService,
  ) {}

  // ─── ACTIVATION FLOW ──────────────────────────────────────────

  @Post('activate/request')
  @ApiOperation({
    summary: '🟢 Step 1 — Request account activation',
    description: 'Employee provides Matricule + CIN + Date of Birth. Backend sends OTP to their STB email.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent to employee email' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Account already activated' })
  async requestActivation(@Body() dto: ActivateRequestDto, @Req() req: Request) {
    return this.authService.requestActivation(dto);
  }

  @Post('activate/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🟢 Step 2 — Verify OTP code',
    description: 'Verify the 6-digit OTP code. Returns a setup token for next steps.',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('activate/set-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🟢 Step 3 — Create password',
    description: 'Employee creates their secure password (8+ chars, uppercase, number, symbol required).',
  })
  async createPassword(
    @CurrentUser('sub') employeeId: string,
    @Body() dto: CreatePasswordDto,
  ) {
    return this.authService.createPassword(employeeId, dto);
  }

  @Post('activate/set-pin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🟢 Step 4 — Create 6-digit PIN',
    description: 'Employee creates a 6-digit PIN for offline/biometric fallback authentication.',
  })
  async createPin(
    @CurrentUser('sub') employeeId: string,
    @Body() dto: CreatePinDto,
  ) {
    return this.authService.createPin(employeeId, dto);
  }

  @Post('activate/enable-biometrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🟢 Step 5 — Enable Face ID / Fingerprint (completes activation)',
    description: 'Final activation step. Enables biometrics and marks account as ACTIVE.',
  })
  async enableBiometrics(
    @CurrentUser('sub') employeeId: string,
    @Body() dto: EnableBiometricsDto,
  ) {
    return this.authService.enableBiometrics(employeeId, dto);
  }

  // ─── LOGIN FLOW ───────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔑 Login with Matricule + Password',
    description: 'Returns JWT access token (15min) + refresh token (30 days). Include device UUID for trusted device management.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or suspended' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('login/web')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🖥️ Web Dashboard Login — RH / Admin only',
    description: 'Dedicated login for the RH web dashboard. Accepts any RH/ADMIN account regardless of mobile activation status.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied — RH/Admin only' })
  async loginWeb(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.authService.loginWeb(dto, ip, userAgent);
  }

  @Post('login/biometric')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '👁️ Login with Face ID / Fingerprint',
    description: 'Fast authentication for trusted devices with biometrics enabled. No password needed.',
  })
  async biometricLogin(@Body() dto: BiometricLoginDto, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.biometricLogin(dto, ip, userAgent);
  }

  @Post('login/pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔢 Login with PIN (biometric fallback)',
    description: 'Fallback authentication using 6-digit PIN when biometrics fail.',
  })
  async pinLogin(@Body() dto: PinLoginDto, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.pinLogin(dto, ip, userAgent);
  }

  // ─── TOKEN MANAGEMENT ─────────────────────────────────────────

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔄 Refresh access token',
    description: 'Exchange an expired access token for a new one using the refresh token. Token rotation is applied.',
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🚪 Logout (revoke current session)',
    description: 'Revokes the current access token/session. Biometrics remain enabled.',
  })
  async logout(
    @CurrentUser('sub') employeeId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(employeeId, token);
  }

  // ─── PASSWORD RECOVERY ────────────────────────────────────────

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔓 Forgot password — request OTP',
    description: 'Sends a password reset OTP to the employee\'s STB email.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔓 Reset password with OTP',
    description: 'Resets password using OTP code. All active sessions are revoked.',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ─── DEVICE MANAGEMENT ────────────────────────────────────────

  @Post('device/change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📱 Change trusted device',
    description: 'Register a new device and revoke trust from all old devices. Requires OTP verification.',
  })
  async changeDevice(@Body() dto: ChangeDeviceDto) {
    return this.authService.changeDevice(dto);
  }

  // ─── ME ───────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '👤 Get current authenticated employee (full profile)',
    description: 'Returns the full employee document from the database.',
  })
  async me(@CurrentUser() user: any) {
    const employee = await this.employeesService.findOne(user.sub);
    return employee;
  }
}
