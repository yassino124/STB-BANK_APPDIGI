"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const storage_1 = require("firebase-admin/storage");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    logger = new common_1.Logger(FirebaseService_1.name);
    messaging;
    storage;
    constructor() {
        try {
            const serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
            };
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
            this.messaging = (0, messaging_1.getMessaging)();
            this.storage = (0, storage_1.getStorage)();
            this.logger.log('Firebase initialized successfully');
        }
        catch (error) {
            this.logger.warn(`Firebase initialization failed: ${error.message}. Running without Firebase.`);
            this.messaging = null;
            this.storage = null;
        }
    }
    async sendPushNotification(token, title, body, data) {
        if (!this.messaging) {
            this.logger.warn('Firebase not initialized, skipping push notification');
            return null;
        }
        try {
            const message = {
                notification: { title, body },
                data: data || {},
                token,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'stb_notifications',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await this.messaging.send(message);
            this.logger.log(`Push notification sent: ${response}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
            return null;
        }
    }
    async sendMulticastNotification(tokens, title, body, data) {
        if (!this.messaging) {
            this.logger.warn('Firebase not initialized, skipping multicast notification');
            return null;
        }
        try {
            const message = {
                notification: { title, body },
                data: data || {},
                tokens,
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'stb_notifications',
                        sound: 'default',
                    },
                },
            };
            const response = await this.messaging.sendMulticast(message);
            this.logger.log(`Multicast notification sent to ${response.successCount} devices`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to send multicast notification: ${error.message}`, error.stack);
            return null;
        }
    }
    async uploadFile(buffer, path, contentType) {
        if (!this.storage) {
            this.logger.warn('Firebase Storage not initialized');
            return null;
        }
        try {
            const bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
            const file = bucket.file(path);
            await file.save(buffer, { contentType });
            const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2500' });
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
            return null;
        }
    }
    async deleteFile(path) {
        if (!this.storage) {
            this.logger.warn('Firebase Storage not initialized');
            return false;
        }
        try {
            const bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
            await bucket.file(path).delete();
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
            return false;
        }
    }
    async getFileUrl(path) {
        if (!this.storage) {
            this.logger.warn('Firebase Storage not initialized');
            return null;
        }
        try {
            const bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
            const [url] = await bucket.file(path).getSignedUrl({ action: 'read', expires: '03-01-2500' });
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to get file URL: ${error.message}`, error.stack);
            return null;
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map