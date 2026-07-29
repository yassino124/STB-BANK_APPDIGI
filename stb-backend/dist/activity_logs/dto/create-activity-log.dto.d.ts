export declare class CreateActivityLogDto {
    employeeId: string;
    action: string;
    module: string;
    resource?: string;
    resourceId?: string;
    changes?: any;
    ip?: string;
    userAgent?: string;
    success?: boolean;
}
