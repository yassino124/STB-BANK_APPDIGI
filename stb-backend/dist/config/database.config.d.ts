declare const _default: (() => {
    uri: string;
    dbName: string;
    connectionOptions: {
        maxPoolSize: number;
        minPoolSize: number;
        socketTimeoutMS: number;
        serverSelectionTimeoutMS: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    uri: string;
    dbName: string;
    connectionOptions: {
        maxPoolSize: number;
        minPoolSize: number;
        socketTimeoutMS: number;
        serverSelectionTimeoutMS: number;
    };
}>;
export default _default;
