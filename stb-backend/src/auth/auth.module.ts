import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Employee, EmployeeSchema } from '../employees/employee.schema';
import { Device, DeviceSchema } from '../devices/device.schema';
import { Session, SessionSchema } from '../sessions/session.schema';
import { OtpModule } from '../otp/otp.module';
import { AuditModule } from '../audit/audit.module';
import { EmployeesService } from '../employees/employees.service';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'fallback_secret'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRES', '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    OtpModule,
    AuditModule,
    forwardRef(() => AccountsModule),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, EmployeesService],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
