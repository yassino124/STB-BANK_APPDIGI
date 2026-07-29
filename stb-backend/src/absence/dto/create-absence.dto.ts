import { ApiProperty } from '@nestjs/swagger';
import { AbsenceType } from '../schemas/absence.schema';

export class CreateAbsenceDto {
  @ApiProperty({ enum: AbsenceType })
  type: AbsenceType;

  @ApiProperty()
  dateDebut: Date;

  @ApiProperty()
  dateFin: Date;

  @ApiProperty()
  nombreHeures: number;

  @ApiProperty({ required: false })
  motif?: string;

  @ApiProperty({ required: false })
  pieceJointe?: string;
}