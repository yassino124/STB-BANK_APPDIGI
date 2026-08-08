import { Document, Types } from 'mongoose';
import { Role } from '../common/enums/role.enum';
import { EmployeeStatus } from '../common/enums/employee-status.enum';
export type EmployeeDocument = Employee & Document;
export declare class Employee {
    matricule: string;
    cin: string;
    dateNaissance: Date;
    nom: string;
    prenom: string;
    email: string;
    phone: string;
    passwordHash: string | null;
    pinHash: string | null;
    roles: Role[];
    status: EmployeeStatus;
    faceEnabled: boolean;
    fingerEnabled: boolean;
    isActivated: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    lastLoginAt: Date | null;
    passwordChangedAt: Date | null;
    avatar: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    poste: string | null;
    departmentId: Types.ObjectId | null;
    branchId: Types.ObjectId | null;
    managerId: Types.ObjectId | null;
    directorId: Types.ObjectId | null;
    centralDirectorId: Types.ObjectId | null;
    service: string | null;
    direction: string | null;
    contractType: string | null;
    contractStart: Date | null;
    contractEnd: Date | null;
    workSchedule: string | null;
    shiftPattern: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelationship: string | null;
    bankRib: string | null;
    bankName: string | null;
    soldeConges: number;
    creditsEnCours: number;
    avancesEnCours: number;
    prime: number;
    salaireBase: number;
    dateEmbauche: Date;
    compteSolde: number;
    metadata: Record<string, any>;
}
export declare const EmployeeSchema: import("mongoose").Schema<Employee, import("mongoose").Model<Employee, any, any, any, any, any, Employee>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Employee, Document<unknown, {}, Employee, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    matricule?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    cin?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateNaissance?: import("mongoose").SchemaDefinitionProperty<Date, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    nom?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    prenom?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    passwordHash?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    pinHash?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    roles?: import("mongoose").SchemaDefinitionProperty<Role[], Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<EmployeeStatus, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    faceEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fingerEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActivated?: import("mongoose").SchemaDefinitionProperty<boolean, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    failedLoginAttempts?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lockedUntil?: import("mongoose").SchemaDefinitionProperty<Date | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    lastLoginAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    passwordChangedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    avatar?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    city?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    country?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    poste?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    departmentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    branchId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    managerId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    directorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    centralDirectorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    service?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    direction?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    contractType?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    contractStart?: import("mongoose").SchemaDefinitionProperty<Date | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    contractEnd?: import("mongoose").SchemaDefinitionProperty<Date | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    workSchedule?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    shiftPattern?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    emergencyContactName?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    emergencyContactPhone?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    emergencyContactRelationship?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bankRib?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    bankName?: import("mongoose").SchemaDefinitionProperty<string | null, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    soldeConges?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    creditsEnCours?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    avancesEnCours?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    prime?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    salaireBase?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    dateEmbauche?: import("mongoose").SchemaDefinitionProperty<Date, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    compteSolde?: import("mongoose").SchemaDefinitionProperty<number, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Employee, Document<unknown, {}, Employee, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Employee & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Employee>;
