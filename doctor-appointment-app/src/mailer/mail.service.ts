import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = parseInt(this.config.get<string>('SMTP_PORT') || '587', 10);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const fromEmail =
      this.config.get<string>('FROM_EMAIL') || 'noreply@mydent.com';
    this.from = `Mydent <${fromEmail}>`;

    if (!user || !pass) {
      this.logger.error(
        'SMTP_USER or SMTP_PASS is not set — email sending will fail',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  /** Shared OTP email builder */
  private buildOtpHtml(title: string, description: string, otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #023c69; margin: 0; font-size: 28px;">Mydent</h1>
        </div>
        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">${title}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">${description}</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <div style="background: #ffffff; padding: 15px; border-radius: 8px; display: inline-block;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #023c69;">
              ${otp}
            </span>
          </div>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          This code will expire in <strong>5 minutes</strong> for security reasons.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          If you didn't request this code, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <div style="text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 5px 0;">
            &copy; ${new Date().getFullYear()} Mydent. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  /** Send OTP for login */
  async sendOtpEmail(
    email: string,
    otp: string,
  ): Promise<{ statusCode: number; id?: string }> {
    const html = this.buildOtpHtml(
      'Your Login Code',
      'You requested to login to your Mydent account. Use the code below to continue:',
      otp,
    );

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Your Mydent Login Code',
        html,
      });
      this.logger.log(`OTP email sent to ${email}, messageId: ${info.messageId}`);
      return { statusCode: 202, id: info.messageId };
    } catch (err) {
      this.logger.error(`Error sending OTP email to ${email}`, err);
      throw new Error('Failed to send OTP email');
    }
  }

  /** Send OTP for password reset */
  async sendPasswordResetOtpEmail(
    email: string,
    otp: string,
  ): Promise<{ statusCode: number; id?: string }> {
    const html = this.buildOtpHtml(
      'Password Reset Code',
      'You requested to reset your Mydent account password. Use the code below to proceed:',
      otp,
    );

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Password Reset Code - Mydent',
        html,
      });
      this.logger.log(`Password reset OTP sent to ${email}, messageId: ${info.messageId}`);
      return { statusCode: 202, id: info.messageId };
    } catch (err) {
      this.logger.error(`Error sending password reset OTP to ${email}`, err);
      throw new Error('Failed to send password reset email');
    }
  }

  /** Send OTP for email verification during signup */
  async sendEmailVerificationOtp(
    email: string,
    otp: string,
  ): Promise<{ statusCode: number; id?: string }> {
    const html = this.buildOtpHtml(
      'Verify Your Email',
      'Thank you for signing up with Mydent! Please use the code below to verify your email address:',
      otp,
    );

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Verify Your Email - Mydent',
        html,
      });
      this.logger.log(`Verification OTP sent to ${email}, messageId: ${info.messageId}`);
      return { statusCode: 202, id: info.messageId };
    } catch (err) {
      this.logger.error(`Error sending verification OTP to ${email}`, err);
      throw new Error('Failed to send verification email');
    }
  }
}
