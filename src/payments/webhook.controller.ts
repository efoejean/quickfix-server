export const webhookController = `
import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import Stripe from 'stripe';


@ApiExcludeController()
@Controller('webhooks/stripe')
export class StripeWebhookController {
private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });


@Post()
async handle(@Req() req: any, @Res() res: any, @Headers('stripe-signature') sig: string) {
const raw = req.rawBody || req.body; // configure rawBody in main.ts if needed
let event: Stripe.Event;
try {
event = this.stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
} catch (err) {
return res.status(400).send(` + "`Webhook Error: ${err.message}`" + `);
}
// TODO: handle payment_intent.succeeded / payment_intent.payment_failed
res.json({ received: true });
}
}
`;