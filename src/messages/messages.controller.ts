import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { Request } from 'express';

/**
 * 💬 MessagesController
 * Handles all chat-related endpoints tied to a specific job.
 * Each message belongs to a job and is sent by a logged-in user.
 */
@UseGuards(JwtAuthGuard) // ✅ Protect all routes with JWT authentication
@Controller('jobs/:jobId/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  /**
   * 🧾 GET /jobs/:jobId/messages
   * Fetch all chat messages for a given job.
   * Accessible only to authenticated users (customer or pro).
   */
  @Get()
  async list(@Param('jobId') jobId: string) {
    return this.messages.list(jobId);
  }

  /**
   * 📩 POST /jobs/:jobId/messages
   * Send a new chat message for a given job.
   * Body contains the message text and optional media array.
   */
  @Post()
  async send(
    @Req() req: Request, // access Auth0 user from JWT
    @Param('jobId') jobId: string,
    @Body() body: { message: string; media?: string[] },
  ) {
    // Extract Auth0 user ID (unique subject identifier)
    const fromUserSub = req.user?.sub as string;

    // Pass to service to handle database logic
    return this.messages.send(jobId, fromUserSub, body.message, body.media);
  }
}
