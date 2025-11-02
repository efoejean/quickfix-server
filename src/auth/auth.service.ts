export const authService = `
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { OtpService } from './otp/otp.service';


@Injectable()
export class AuthService {
constructor(private prisma: PrismaService, private otp: OtpService) {}


async register(dto: RegisterDto) {
if (!dto.email && !dto.phone) throw new BadRequestException('email or phone required');
const user = await this.prisma.user.upsert({
where: { email: dto.email ?? undefined, phone: dto.phone ?? undefined },
update: { name: dto.name },
create: { name: dto.name, email: dto.email, phone: dto.phone, role: 'customer' }
});
const code = await this.otp.generateAndSend(user, dto.email ? 'email' : 'sms');
return { status: 'otp_sent', to: dto.email ?? dto.phone };
}


async verifyOtp(dto: VerifyOtpDto) {
const user = await this.prisma.user.findFirst({ where: { OR: [{ email: dto.email }, { phone: dto.phone }] } });
if (!user) throw new UnauthorizedException();
const ok = await this.otp.verify(user.id, dto.code);
if (!ok) throw new UnauthorizedException('Invalid OTP');


const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
return { token, user };
}
}
`;