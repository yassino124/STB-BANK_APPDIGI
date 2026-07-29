export declare class CreatePayrollDto {
    employeeId: string;
    mois: number;
    annee: number;
    salaireBrut?: number;
    cnss?: number;
    impot?: number;
    prime?: number;
    heuresSup?: number;
    retenues?: number;
    salaireNet?: number;
    status?: string;
}
