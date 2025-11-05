import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 💬 MessagesService
 * Handles all database logic for job chat messages.
 * Uses Prisma to create and retrieve messages.
 */
@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🧾 List all messages for a specific job.
   * Messages are ordered chronologically (oldest → newest).
   */
  async list(jobId: string) {
    return this.prisma.message.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * ✉️ Send a new message in a job chat.
   * Automatically links the message to:
   *  - the corresponding Job
   *  - the sender (Auth0 user)
   */
  async send(
    jobId: string,
    fromUserAuth0Sub: string,
    body: string,
    media?: string[],
  ) {
    return this.prisma.message.create({
      data: {
        body,
        media: media ?? [],
        // Link message to the job
        job: { connect: { id: jobId } },
        // Link or create the sender user based on their Auth0 sub
        fromUser: {
          connectOrCreate: {
            where: { auth0Sub: fromUserAuth0Sub },
            create: {
              auth0Sub: fromUserAuth0Sub,
              role: 'customer', // default role (could be 'pro' later)
              name: 'User',
            },
          },
        },
      },
    });
  }
}
