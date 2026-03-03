import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SendOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

export class VerifyOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp!: string;
}
