import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private messaging: admin.messaging.Messaging;
  private storage: admin.storage.Storage;

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

      initializeApp({
        credential: cert(serviceAccount as any),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });

      this.messaging = getMessaging();
      this.storage = getStorage();
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.warn(`Firebase initialization failed: ${error.message}. Running without Firebase.`);
      this.messaging = null as any;
      this.storage = null as any;
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!this.messaging) {
      this.logger.warn('Firebase not initialized, skipping push notification');
      return null;
    }

    try {
      const message: admin.messaging.Message = {
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
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      return null;
    }
  }

  async sendMulticastNotification(tokens: string[], title: string, body: string, data?: any) {
    if (!this.messaging) {
      this.logger.warn('Firebase not initialized, skipping multicast notification');
      return null;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
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
    } catch (error) {
      this.logger.error(`Failed to send multicast notification: ${error.message}`, error.stack);
      return null;
    }
  }

  async uploadFile(buffer: Buffer, path: string, contentType: string) {
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
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      return null;
    }
  }

  async deleteFile(path: string) {
    if (!this.storage) {
      this.logger.warn('Firebase Storage not initialized');
      return false;
    }

    try {
      const bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
      await bucket.file(path).delete();
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      return false;
    }
  }

  async getFileUrl(path: string) {
    if (!this.storage) {
      this.logger.warn('Firebase Storage not initialized');
      return null;
    }

    try {
      const bucket = this.storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
      const [url] = await bucket.file(path).getSignedUrl({ action: 'read', expires: '03-01-2500' });
      return url;
    } catch (error) {
      this.logger.error(`Failed to get file URL: ${error.message}`, error.stack);
      return null;
    }
  }
}
