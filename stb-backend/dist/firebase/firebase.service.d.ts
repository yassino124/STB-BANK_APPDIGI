export declare class FirebaseService {
    private readonly logger;
    private messaging;
    private storage;
    constructor();
    sendPushNotification(token: string, title: string, body: string, data?: any): Promise<string | null>;
    sendMulticastNotification(tokens: string[], title: string, body: string, data?: any): Promise<import("firebase-admin/messaging").BatchResponse | null>;
    uploadFile(buffer: Buffer, path: string, contentType: string): Promise<string | null>;
    deleteFile(path: string): Promise<boolean>;
    getFileUrl(path: string): Promise<string | null>;
}
