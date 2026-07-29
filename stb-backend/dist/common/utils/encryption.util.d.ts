export declare class EncryptionUtil {
    static encrypt(text: string, key: string): string;
    static decrypt(encryptedText: string, key: string): string;
    static hashSensitiveData(data: string): string;
}
