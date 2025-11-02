export const smsProvider = `
import { Injectable } from '@nestjs/common';
import twilio from 'twilio';


@Injectable()
export class SmsProvider {
private client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);


async send(to: string, code: string) {
if (!to) return;
await this.client.messages.create({ from: process.env.TWILIO_FROM, to, body: \`Your HandyLink code: \${code}\` });
}
}
`;