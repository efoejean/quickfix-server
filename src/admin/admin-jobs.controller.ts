// src/admin/admin-jobs.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus, Role } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('admin/jobs')
export class AdminJobsController {
  constructor(private prisma: PrismaService) {}

  // 🔐 Small helper to ensure the caller is an admin
  private async ensureAdmin(req: Request) {
    const authUser = (req as any).user;
    const sub = authUser?.sub as string | undefined;

    if (!sub) throw new ForbiddenException('Missing auth0 sub');

    const user = await this.prisma.user.findUnique({
      where: { auth0Sub: sub },
    });

    if (!user || user.role !== Role.admin) {
      throw new ForbiddenException('Admin access only');
    }

    return user;
  }

  // GET /admin/jobs?status=open
  @Get()
async list(@Req() req: Request, @Query('status') status?: JobStatus | 'all') {
  await this.ensureAdmin(req);

  return this.prisma.job.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,   // 👈 AJOUT
        },
      },
      category: {
        select: { name: true },
      },
    },
    take: 100,
  });
}

  // GET /admin/jobs/:id
  @Get(':id')
async getOne(@Req() req: Request, @Param('id') id: string) {
  await this.ensureAdmin(req);

  return this.prisma.job.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,   // 👈 AJOUT
        },
      },
      category: {
        select: { name: true },
      },
      acceptances: {
        include: { pro: true },
      },
      disputes: true,
    },
  });
}

// PATCH /admin/jobs/:id/cancel
@Patch(':id/cancel')
async cancelJob(@Req() req: Request, @Param('id') id: string) {
  await this.ensureAdmin(req);

  return this.prisma.job.update({
    where: { id },
    data: {
      status: JobStatus.canceled,
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      category: { select: { name: true } },
      acceptances: { include: { pro: true } },
      disputes: true,
    },
  });
}

// PATCH /admin/jobs/:id/complete
@Patch(':id/complete')
async completeJob(@Req() req: Request, @Param('id') id: string) {
  await this.ensureAdmin(req);

  return this.prisma.job.update({
    where: { id },
    data: {
      status: JobStatus.completed,
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      category: { select: { name: true } },
      acceptances: { include: { pro: true } },
      disputes: true,
    },
  });
}
}
