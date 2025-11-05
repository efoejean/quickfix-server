// src/demo.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller()
export class DemoController {
  @UseGuards(AuthGuard('jwt')) // 👈 name must be 'jwt'
  @Get('demo')
  getDemo(@Req() req: Request) {
    return {
      message: '✅ Protected /demo route reached!',
      user: req.user,
    };
  }
}


// import { Controller, Get, UseGuards, Req } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';

// @Controller()
// export class AppController {
//   @UseGuards(AuthGuard('jwt'))
//   @Get('demo')
//   getDemo(@Req() req: Request) {
//     return {
//       message: '✅ Protected /demo route reached!',
//       user: req.user, // comes from JwtStrategy.validate()
//     };
//   }
//}


/**
 * Public demo endpoints (no auth).
 */
// @Controller()
// export class DemoController {
//   @UseGuards(AuthGuard('jwt'))
//   @Get()
//   get(@Req() req: any) {
//     return { ok: true, sub: req.user?.sub, when: new Date().toISOString() };
//   }
//   @Get('demo')
//   async demo() {
//     // Try the seeded id first; if missing, return the latest open job
//     const seedId = 'demo-job-1';

//     const job =
//       (await prisma.job.findUnique({
//         where: { id: seedId },
//         include: {
//           category: true,
//           customer: { select: { id: true, name: true, auth0Sub: true } },
//           acceptances: { include: { pro: { select: { id: true, name: true } } } },
//           messages: { orderBy: { createdAt: 'asc' } },
//         },
//       })) ??
//       (await prisma.job.findFirst({
//         where: { status: 'open' },
//         orderBy: { createdAt: 'desc' },
//         include: {
//           category: true,
//           customer: { select: { id: true, name: true, auth0Sub: true } },
//           acceptances: { include: { pro: { select: { id: true, name: true } } } },
//           messages: { orderBy: { createdAt: 'asc' } },
//         },
//       }));

//     if (!job) {
//       return {
//         ok: false,
//         message:
//           'No demo job found. Run "npm run seed" or create a job first.',
//       };
//     }

//     return {
//       ok: true,
//       job,
//       hint:
//         'This is a public demo endpoint (no auth). Use it to test mobile/web quickly.',
//     };
//   }
// }
