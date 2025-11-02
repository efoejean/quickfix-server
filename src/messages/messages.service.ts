import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  list(jobId: string) {
    return this.prisma.message.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async send(jobId: string, fromUserAuth0Sub: string, body: string, media?: string[]) {
    return this.prisma.message.create({
      data: {
        body,
        media: media ?? [],
        job: { connect: { id: jobId } }, // connect relation
        fromUser: {
          connectOrCreate: {
            where: { auth0Sub: fromUserAuth0Sub },
            create: { auth0Sub: fromUserAuth0Sub, role: 'customer', name: 'User' },
          },
        },
      },
    });
  }
}
