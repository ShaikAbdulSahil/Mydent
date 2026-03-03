import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt-strategy';
import { DoctorModule } from 'src/doctor/doc.module';
import { MailerService } from 'src/mailer/mail.service';

@Module({
  imports: [
    UserModule,
    DoctorModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'supersecret',
      signOptions: { expiresIn: '7d' },
    }),
    CacheModule.register({
      ttl: 300, // 5 minutes in seconds
      max: 100, // maximum number of items in cache
    }),
  ],
  providers: [AuthService, MailerService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
