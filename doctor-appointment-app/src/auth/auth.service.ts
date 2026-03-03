import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { User } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoctorSignupDto } from 'src/doctor/doc.dto';
import { DoctorService } from 'src/doctor/doc.service';
import { DoctorDocument } from 'src/doctor/doc.schema';
import * as crypto from 'crypto';
import { MailerService } from 'src/mailer/mail.service';
import { AdminLoginDto } from './dto/admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly doctorService: DoctorService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async signup(dto: SignupDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userModel.create({
      email: dto.email,
      firstName: dto.firstName,
      password: hashed,
      mobile: dto.mobile,
      address: dto.address,
      balance: 0,
    });

    return {
      access_token: await this.jwtService.signAsync({
        sub: newUser._id,
        email: newUser.email,
      }),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new ConflictException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ConflictException('Invalid credentials');

    return {
      access_token: await this.jwtService.signAsync({
        sub: user._id,
        email: user.email,
      }),
    };
  }

  async signupDoctor(dto: DoctorSignupDto): Promise<{ access_token: string }> {
    const existing: DoctorDocument | null =
      await this.doctorService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const doctor: DoctorDocument = await this.doctorService.create({
      ...dto,
      password: hashed,
    });

    return {
      access_token: await this.jwtService.signAsync({
        sub: doctor._id.toString(),
        email: doctor.email,
      }),
    };
  }

  async loginDoctor(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const doctor: DoctorDocument | null =
      await this.doctorService.findByEmail(email);
    if (!doctor) throw new ConflictException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) throw new ConflictException('Invalid credentials');

    return {
      access_token: await this.jwtService.signAsync({
        sub: doctor._id.toString(),
        email: doctor.email,
      }),
    };
  }

  async signupAdmin(dto: AdminLoginDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser)
      throw new ConflictException('Admin email already registered');
    const hashed = await bcrypt.hash(dto.password, 10);
    const newAdmin = await this.userModel.create({
      email: dto.email,
      firstName: 'Admin',
      password: hashed,
      mobile: '0000000000',
      balance: 0,
      role: 'admin',
    });

    return {
      access_token: await this.jwtService.signAsync({
        sub: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
      }),
    };
  }

  async loginAdmin(dto: AdminLoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.role !== 'admin') throw new UnauthorizedException('Access denied');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: { _id: user._id, email: user.email, role: user.role },
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const otp = this.generateOTP();
    const cacheKey = `pwd-reset:${email}`;
    await this.cacheManager.set(cacheKey, otp, 300000); // 5 minutes

    try {
      await this.mailerService.sendPasswordResetOtpEmail(email, otp);
      return { message: 'Password reset code sent to your email', expiresIn: 300 };
    } catch (error) {
      await this.cacheManager.del(cacheKey);
      console.error('Password reset email error:', error);
      throw new BadRequestException('Failed to send reset code. Please try again.');
    }
  }

  async verifyPasswordResetOTP(email: string, otp: string) {
    const cacheKey = `pwd-reset:${email}`;
    const storedOtp = await this.cacheManager.get<string>(cacheKey);

    if (!storedOtp) {
      throw new BadRequestException('Code has expired. Please request a new one.');
    }
    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid code');
    }

    // Mark as verified — store a temporary token so resetPassword knows it's legit
    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.set(`pwd-reset-verified:${email}`, resetToken, 600000); // 10 min

    return { message: 'Code verified', resetToken };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const storedToken = await this.cacheManager.get<string>(`pwd-reset-verified:${email}`);
    if (!storedToken || storedToken !== resetToken) {
      throw new BadRequestException('Invalid or expired reset session. Please start over.');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await this.cacheManager.del(`pwd-reset-verified:${email}`);

    return { message: 'Password reset successfully' };
  }

  // OTP-based login methods
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string) {
    // Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    // Generate 6-digit OTP
    const otp = this.generateOTP();

    // Store OTP in cache with 5 minutes expiry
    const cacheKey = `otp:${email}`;
    await this.cacheManager.set(cacheKey, otp, 300000); // 300000ms = 5 minutes

    // Send OTP via email
    try {
      await this.mailerService.sendOtpEmail(email, otp);
      return {
        message: 'OTP sent successfully to your email',
        expiresIn: 300, // seconds
      };
    } catch (error) {
      // Clean up cache if email fails
      await this.cacheManager.del(cacheKey);
      console.error('SMTP error while sending OTP:', error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  async verifyOTP(email: string, otp: string) {
    // Get OTP from cache
    const cacheKey = `otp:${email}`;
    const storedOtp = await this.cacheManager.get<string>(cacheKey);

    if (!storedOtp) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP is valid, get user and generate token
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete OTP from cache after successful verification
    await this.cacheManager.del(cacheKey);

    // Generate JWT token
    return {
      access_token: await this.jwtService.signAsync({
        sub: user._id,
        email: user.email,
      }),
    };
  }

  async resendOTP(email: string) {
    // Check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    // Check if there's a recent resend request (rate limiting - 60 second cooldown)
    const cacheKey = `otp:${email}`;
    const resendCooldownKey = `otp:resend:${email}`;

    const cooldownActive = await this.cacheManager.get<string>(resendCooldownKey);
    if (cooldownActive) {
      throw new BadRequestException('Please wait 60 seconds before requesting another OTP.');
    }

    // Delete existing OTP if present
    await this.cacheManager.del(cacheKey);

    // Set resend cooldown for 60 seconds
    await this.cacheManager.set(resendCooldownKey, 'true', 60000); // 60 seconds

    // Generate and send new OTP
    return this.sendOTP(email);
  }

  // ─── Email Verification for Signup ───────────────────────

  async sendSignupVerificationOTP(email: string) {
    // Check if email is already registered
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const otp = this.generateOTP();
    const cacheKey = `signup-verify:${email}`;
    await this.cacheManager.set(cacheKey, otp, 300000); // 5 minutes

    try {
      await this.mailerService.sendEmailVerificationOtp(email, otp);
      return { message: 'Verification code sent to your email', expiresIn: 300 };
    } catch (error) {
      await this.cacheManager.del(cacheKey);
      console.error('Signup verification email error:', error);
      throw new BadRequestException('Failed to send verification code. Please try again.');
    }
  }

  async verifySignupEmail(email: string, otp: string) {
    const cacheKey = `signup-verify:${email}`;
    const storedOtp = await this.cacheManager.get<string>(cacheKey);

    if (!storedOtp) {
      throw new BadRequestException('Code has expired. Please request a new one.');
    }
    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.cacheManager.del(cacheKey);

    // Mark email as verified in cache (valid for 30 min to complete signup)
    await this.cacheManager.set(`signup-verified:${email}`, 'true', 1800000);

    return { message: 'Email verified successfully', verified: true };
  }

  async signupWithVerification(dto: SignupDto) {
    // Check if email was verified
    const isVerified = await this.cacheManager.get<string>(`signup-verified:${dto.email}`);
    if (!isVerified) {
      throw new BadRequestException('Email not verified. Please verify your email first.');
    }

    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userModel.create({
      email: dto.email,
      firstName: dto.firstName,
      password: hashed,
      mobile: dto.mobile,
      address: dto.address,
      balance: 0,
    });

    // Clean up verification cache
    await this.cacheManager.del(`signup-verified:${dto.email}`);

    return {
      access_token: await this.jwtService.signAsync({
        sub: newUser._id,
        email: newUser.email,
      }),
    };
  }
}
