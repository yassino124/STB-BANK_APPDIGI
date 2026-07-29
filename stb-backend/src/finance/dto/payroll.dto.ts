import { ApiProperty } from '@nestjs/swagger';
import { PayrollStatus } from '../schemas/payroll.schema';

export class CreatePayrollDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  month: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  salaireBase: number;

  @ApiProperty({ required: false })
  prime?: number;

  @ApiProperty({ required: false })
  avancesDeduites?: number;

  @ApiProperty({ required: false })
  creditsDeduits?: number;

  @ApiProperty({ required: false })
  impot?: number;

  @ApiProperty({ required: false })
  securiteSociale?: number;
}

export class UpdatePayrollStatusDto {
  @ApiProperty({ enum: PayrollStatus })
  status: PayrollStatus;

  @ApiProperty({ required: false })
  commentaire?: string;
}