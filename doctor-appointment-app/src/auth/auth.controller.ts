import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { DoctorSignupDto } from 'src/doctor/doc.dto';
import { AdminLoginDto } from './dto/admin.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // ─── User Signup (with email verification) ───────────────

  @Post('signup/user')
  signup(@Body() dto: SignupDto) {
    return this.authService.signupWithVerification(dto);
  }

  // ─── Email Verification ──────────────────────────────────

  @Post('send-verification-email')
  sendVerificationEmail(@Body() dto: { email: string }) {
    return this.authService.sendSignupVerificationOTP(dto.email);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifySignupEmail(dto.email, dto.otp);
  }

  // ─── Login ───────────────────────────────────────────────

  @Post('login/user')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('signup/doctor')
  signupDoctor(@Body() dto: DoctorSignupDto) {
    return this.authService.signupDoctor(dto);
  }

  @Post('login/doctor')
  loginDoctor(@Body() dto: { email: string; password: string }) {
    return this.authService.loginDoctor(dto.email, dto.password);
  }

  @Post('login/admin')
  loginAdmin(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('signup/admin')
  signupAdmin(@Body() dto: AdminLoginDto) {
    return this.authService.signupAdmin(dto);
  }

  // ─── Forgot Password (OTP-based) ────────────────────────

  @Post('forgot-password')
  forgotPassword(@Body() dto: { email: string }) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('verify-reset-otp')
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyPasswordResetOTP(dto.email, dto.otp);
  }

  @Post('reset-password')
  resetPassword(
    @Body() dto: { email: string; resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      dto.email,
      dto.resetToken,
      dto.newPassword,
    );
  }

  // ─── Login OTP ──────────────────────────────────────────

  @Post('send-otp')
  sendOTP(@Body() dto: SendOtpDto) {
    return this.authService.sendOTP(dto.email);
  }

  @Post('verify-otp')
  verifyOTP(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOTP(dto.email, dto.otp);
  }

  @Post('resend-otp')
  resendOTP(@Body() dto: SendOtpDto) {
    return this.authService.resendOTP(dto.email);
  }
}
