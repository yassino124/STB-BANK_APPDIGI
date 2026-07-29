import { AbsenceType } from '../schemas/absence.schema';
export declare class CreateAbsenceDto {
    type: AbsenceType;
    dateDebut: Date;
    dateFin: Date;
    nombreHeures: number;
    motif?: string;
    pieceJointe?: string;
}
