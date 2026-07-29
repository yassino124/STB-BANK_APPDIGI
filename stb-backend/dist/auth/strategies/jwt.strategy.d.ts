import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { EmployeeDocument } from '../../employees/employee.schema';
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
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private employeeModel;
    constructor(configService: ConfigService, employeeModel: Model<EmployeeDocument>);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
