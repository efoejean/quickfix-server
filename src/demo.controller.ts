import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Public demo endpoints (no auth).
 */
@Controller()
export class DemoController {
  @Get('demo')
  async demo() {
    // Try the seeded id first; if missing, return the latest open job
    const seedId = 'demo-job-1';

    const job =
      (await prisma.job.findUnique({
        where: { id: seedId },
        include: {
          category: true,
          customer: { select: { id: true, name: true, auth0Sub: true } },
          acceptances: { include: { pro: { select: { id: true, name: true } } } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })) ??
      (await prisma.job.findFirst({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          customer: { select: { id: true, name: true, auth0Sub: true } },
          acceptances: { include: { pro: { select: { id: true, name: true } } } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
      }));

    if (!job) {
      return {
        ok: false,
        message:
          'No demo job found. Run "npm run seed" or create a job first.',
      };
    }

    return {
      ok: true,
      job,
      hint:
        'This is a public demo endpoint (no auth). Use it to test mobile/web quickly.',
    };
  }
}
