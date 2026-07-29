import { ApiProperty } from '@nestjs/swagger';
import { BudgetStatus } from '../schemas/budget.schema';

export class CreateBudgetDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false })
  commentaire?: string;
}

export class UpdateBudgetProgressDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  isSavings: boolean;
}

export class UpdateBudgetStatusDto {
  @ApiProperty({ enum: BudgetStatus })
  status: BudgetStatus;

  @ApiProperty({ required: false })
  commentaire?: string;
}