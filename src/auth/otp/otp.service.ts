export const otpService = `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';


@Injectable()
export class OtpService {
constructor(private prisma: PrismaService, private email: EmailProvider, private sms: SmsProvider) {}


async generateAndSend(user: any, channel: 'email'|'sms') {
const code = Math.floor(100000 + Math.random()*900000).toString();
const hash = await argon2.hash(code);
const ttl = Number(process.env.OTP_TTL_SEC ?? 300);
await this.prisma.user.update({ where: { id: user.id }, data: { otpHash: hash } });
if (channel === 'email') await this.email.send(user.email, code);
else await this.sms.send(user.phone, code);
setTimeout(async () => { await this.prisma.user.update({ where: { id: user.id }, data: { otpHash: null } }); }, ttl*1000);
return code;
}


async verify(userId: string, code: string) {
const user = await this.prisma.user.findUnique({ where: { id: userId } });
if (!user?.otpHash) return false;
const ok = await argon2.verify(user.otpHash, code);
if (ok) await this.prisma.user.update({ where: { id: userId }, data: { otpHash: null } });
return ok;
}
}
`;