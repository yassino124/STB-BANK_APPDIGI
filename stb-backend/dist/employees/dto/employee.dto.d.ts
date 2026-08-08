import { Role } from '../../common/enums/role.enum';
import { EmployeeStatus } from '../../common/enums/employee-status.enum';
export declare class CreateEmployeeDto {
    matricule?: string;
    cin: string;
    dateNaissance: string;
    nom: string;
    prenom: string;
    email: string;
    phone: string;
    roles?: Role[];
    poste?: string;
    departement?: string;
    agence?: string;
    soldeConges?: number;
    creditsEnCours?: number;
    salaireBase?: number;
    compteSolde?: number;
    prime?: number;
    avatar?: string;
    managerId?: string;
    departmentId?: string;
    branchId?: string;
    service?: string;
    direction?: string;
    directorId?: string;
    centralDirectorId?: string;
}
export declare class UpdateEmployeeFinancialsDto {
    soldeConges?: number;
    creditsEnCours?: number;
    avancesEnCours?: number;
    prime?: number;
    salaireBase?: number;
    compteSolde?: number;
}
export declare class UpdateEmployeeRolesDto {
    roles: Role[];
}
export declare class UpdateEmployeeStatusDto {
    status: EmployeeStatus;
}
export declare class UpdateEmployeeAvatarDto {
    avatar: string;
}
