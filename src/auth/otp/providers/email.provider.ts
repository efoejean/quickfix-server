export const emailProvider = `
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';


@Injectable()
export class EmailProvider {
private transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 1025),
secure: false,
auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});


async send(to: string, code: string) {
if (!to) return;
await this.transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject: 'Your HandyLink code', text: \`Your code is \${code}\` });
}
}
`;