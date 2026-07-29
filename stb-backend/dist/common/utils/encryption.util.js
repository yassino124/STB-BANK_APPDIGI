"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionUtil = void 0;
class EncryptionUtil {
    static encrypt(text, key) {
        const cipher = require('crypto').createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.alloc(16, 0));
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');
        return `${encrypted}:${tag}`;
    }
    static decrypt(encryptedText, key) {
        const [text, tag] = encryptedText.split(':');
        const decipher = require('crypto').createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), Buffer.alloc(16, 0));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static hashSensitiveData(data) {
        return require('crypto').createHash('sha256').update(data).digest('hex');
    }
}
exports.EncryptionUtil = EncryptionUtil;
//# sourceMappingURL=encryption.util.js.map