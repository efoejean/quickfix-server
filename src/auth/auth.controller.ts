export const authController = `
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
constructor(private readonly auth: AuthService) {}


@Post('register')
async register(@Body() dto: RegisterDto) {
return this.auth.register(dto);
}


@Post('verify-otp')
async verify(@Body() dto: VerifyOtpDto) {
return this.auth.verifyOtp(dto);
}
}
`;