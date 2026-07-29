import { ApiProperty } from '@nestjs/swagger';
import { InvestmentStatus } from '../schemas/investment.schema';

export class CreateInvestmentDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  expectedReturn: number;

  @ApiProperty({ required: false })
  commentaire?: string;
}

export class UpdateInvestmentStatusDto {
  @ApiProperty({ enum: InvestmentStatus })
  status: InvestmentStatus;

  @ApiProperty({ required: false })
  commentaire?: string;
}