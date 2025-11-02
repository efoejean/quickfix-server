import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { Request } from 'express'; 

@UseGuards(JwtAuthGuard)
@Controller('jobs/:jobId/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  // 💬 Get chat messages for a job
  @Get()
  async list(@Param('jobId') jobId: string) {
    return this.messages.list(jobId);
  }

  // 📨 Send a new message
async send(
  @Req() req: Request,                                 // type it
  @Param('jobId') jobId: string,
  @Body() body: { message: string; media?: string[] }
) {
  const fromUserId = req.user?.sub as string;          // safe access
  return this.messages.send(jobId, fromUserId, body.message, body.media);
}
}
