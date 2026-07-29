import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { Otp, OtpDocument, OtpPurpose } from './otp.schema';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  private generateCode(length = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * 10)];
    }
    return code;
  }

  async sendOtp(
    employeeId: string,
    purpose: OtpPurpose,
    email: string,
    phone?: string,
  ): Promise<{ message: string; devCode?: string }> {
    // Invalidate existing unused OTPs for same purpose
    await this.otpModel.updateMany(
      { employeeId: new Types.ObjectId(employeeId), purpose, used: false },
      { used: true },
    );

    const otpLength = this.configService.get<number>('OTP_LENGTH', 6);
    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 5);
    const code = this.generateCode(otpLength);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const codeHash = await bcrypt.hash(code, 10);

    await this.otpModel.create({
      employeeId: new Types.ObjectId(employeeId),
      codeHash,
      purpose,
      expiresAt,
      sentToEmail: email,
      sentToPhone: phone || null,
    });

    // Send email
    try {
      await this.sendEmailOtp(email, code, purpose, expiryMinutes);
    } catch (err) {
      this.logger.warn(`Email delivery failed: ${err.message}`);
    }

    this.logger.log(`[OTP] ${purpose} for ${email} | DEV CODE: ${code}`);

    const isDev = this.configService.get('NODE_ENV') === 'development';
    return {
      message: `OTP envoyé à ${email}. Valide pour ${expiryMinutes} minutes.`,
      ...(isDev && { devCode: code }),
    };
  }

  async verifyOtp(
    employeeId: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      purpose,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) return false;

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

  private async sendEmailOtp(
    email: string,
    code: string,
    purpose: OtpPurpose,
    expiry: number,
  ): Promise<void> {
    const labels: Record<OtpPurpose, string> = {
      [OtpPurpose.ACTIVATION]: 'Activation du Compte',
      [OtpPurpose.PASSWORD_RESET]: 'Réinitialisation du Mot de Passe',
      [OtpPurpose.DEVICE_CHANGE]: 'Autorisation Nouvel Appareil',
      [OtpPurpose.EMAIL_VERIFICATION]: 'Vérification Email',
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
}
