import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const fromEmail = this.config.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';
    this.from = `Mydent <${fromEmail}>`;

    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set — email sending will fail');
    }

    this.resend = new Resend(apiKey);
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
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Your Mydent Login Code',
        html,
      });

      if (error) {
        this.logger.error(`Resend API error for ${email}: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`OTP email sent to ${email}, id: ${data?.id}`);
      return { statusCode: 202, id: data?.id };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error sending OTP email to ${email}: ${error.message}`);
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
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Password Reset Code - Mydent',
        html,
      });

      if (error) {
        this.logger.error(`Resend API error for ${email}: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Password reset OTP sent to ${email}, id: ${data?.id}`);
      return { statusCode: 202, id: data?.id };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error sending password reset OTP to ${email}: ${error.message}`);
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
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Verify Your Email - Mydent',
        html,
      });

      if (error) {
        this.logger.error(`Resend API error for ${email}: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Verification OTP sent to ${email}, id: ${data?.id}`);
      return { statusCode: 202, id: data?.id };
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Error sending verification OTP to ${email}: ${error.message}`);
      throw new Error('Failed to send verification email');
    }
  }
}
