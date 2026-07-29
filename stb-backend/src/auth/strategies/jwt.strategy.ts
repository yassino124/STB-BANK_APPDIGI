import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../../employees/employee.schema';
import { EmployeeStatus } from '../../common/enums/employee-status.enum';

export interface JwtPayload {
  sub: string;
  matricule: string;
  roles?: string[];
  purpose?: string;
  step?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'fallback_secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const employee = await this.employeeModel
      .findById(payload.sub)
      .select('status isActivated roles')
      .exec();

    if (!employee) {
      throw new UnauthorizedException('Employé introuvable');
    }

    if (employee.status === EmployeeStatus.SUSPENDED) {
      throw new UnauthorizedException('Compte suspendu');
    }

    // RH / ADMIN / SUPER_ADMIN web users are auto-activated — skip mobile activation check
    const webRoles = ['RH', 'ADMIN', 'SUPER_ADMIN'];
    const isWebUser = (payload.roles || []).some((r) => webRoles.includes(r));

    // Allow setup tokens (during activation flow) or web RH users to bypass mobile activation check
    if (!employee.isActivated && payload.step !== 'otp_verified' && !isWebUser) {
      throw new UnauthorizedException('Compte non activé');
    }

    return payload;
  }
}
