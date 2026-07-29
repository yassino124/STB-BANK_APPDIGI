"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const nodemailer = __importStar(require("nodemailer"));
const otp_schema_1 = require("./otp.schema");
let OtpService = OtpService_1 = class OtpService {
    otpModel;
    configService;
    logger = new common_1.Logger(OtpService_1.name);
    transporter;
    constructor(otpModel, configService) {
        this.otpModel = otpModel;
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT', 587),
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    generateCode(length = 6) {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits[Math.floor(Math.random() * 10)];
        }
        return code;
    }
    async sendOtp(employeeId, purpose, email, phone) {
        await this.otpModel.updateMany({ employeeId: new mongoose_2.Types.ObjectId(employeeId), purpose, used: false }, { used: true });
        const otpLength = this.configService.get('OTP_LENGTH', 6);
        const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 5);
        const code = this.generateCode(otpLength);
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
        const codeHash = await bcrypt.hash(code, 10);
        await this.otpModel.create({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            codeHash,
            purpose,
            expiresAt,
            sentToEmail: email,
            sentToPhone: phone || null,
        });
        try {
            await this.sendEmailOtp(email, code, purpose, expiryMinutes);
        }
        catch (err) {
            this.logger.warn(`Email delivery failed: ${err.message}`);
        }
        this.logger.log(`[OTP] ${purpose} for ${email} | DEV CODE: ${code}`);
        const isDev = this.configService.get('NODE_ENV') === 'development';
        return {
            message: `OTP envoyé à ${email}. Valide pour ${expiryMinutes} minutes.`,
            ...(isDev && { devCode: code }),
        };
    }
    async verifyOtp(employeeId, purpose, code) {
        const otp = await this.otpModel.findOne({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            purpose,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!otp)
            return false;
        if (otp.attempts >= 5) {
            await this.otpModel.updateOne({ _id: otp._id }, { used: true });
            return false;
        }
        await this.otpModel.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
        const isValid = await bcrypt.compare(code, otp.codeHash);
        if (isValid) {
            await this.otpModel.updateOne({ _id: otp._id }, { used: true });
        }
        return isValid;
    }
    async sendEmailOtp(email, code, purpose, expiry) {
        const labels = {
            [otp_schema_1.OtpPurpose.ACTIVATION]: 'Activation du Compte',
            [otp_schema_1.OtpPurpose.PASSWORD_RESET]: 'Réinitialisation du Mot de Passe',
            [otp_schema_1.OtpPurpose.DEVICE_CHANGE]: 'Autorisation Nouvel Appareil',
            [otp_schema_1.OtpPurpose.EMAIL_VERIFICATION]: 'Vérification Email',
        };
        const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>STB OTP</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:40px;text-align:center">
      <h1 style="color:#FFD700;margin:0;font-size:28px">🏦 STB Bank</h1>
      <p style="color:rgba(255,255,255,.8);margin:8px 0 0">${labels[purpose]}</p>
    </div>
    <div style="padding:40px">
      <p style="color:#333;font-size:16px">Votre code de vérification :</p>
      <div style="background:linear-gradient(135deg,#f8f9fa,#e9ecef);border:2px dashed #0f3460;border-radius:12px;text-align:center;padding:30px;margin:24px 0">
        <div style="font-size:52px;font-weight:900;letter-spacing:16px;color:#0f3460;font-family:'Courier New',monospace">${code}</div>
        <p style="color:#666;font-size:14px;margin-top:12px">⏱ Valide pendant ${expiry} minutes</p>
      </div>
      <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:16px;border-radius:4px;margin:20px 0">
        <strong>⚠️ Important :</strong> Ne partagez jamais ce code. STB ne vous demandera jamais votre code par téléphone.
      </div>
    </div>
    <div style="background:#f8f9fa;padding:20px;text-align:center;color:#999;font-size:12px">
      © ${new Date().getFullYear()} Société Tunisienne de Banque — Tous droits réservés
    </div>
  </div>
</body>
</html>`;
        await this.transporter.sendMail({
            from: this.configService.get('SMTP_FROM', '"STB Bank" <noreply@stb.com.tn>'),
            to: email,
            subject: `STB — ${labels[purpose]} : votre code`,
            html,
        });
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(otp_schema_1.Otp.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map