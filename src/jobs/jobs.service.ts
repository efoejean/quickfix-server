import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

    // ✅ PUBLIC: anyone can see all (open) jobs
  async findAll() {
    return this.prisma.job.findMany({
      where: {
        status: 'open', // or remove this line if you truly want *all* jobs
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        addressLine: true,
        lat: true,
        lng: true,
        scheduledStartAt: true,
        timeWindowMins: true,
        budgetFixedCents: true,
        status: true,
        categoryId: true,
      },
    });
  }
  
  async create(customerAuth0Sub: string, dto: CreateJobDto) {
    const customer = await this.prisma.user.upsert({
      where: { auth0Sub: customerAuth0Sub },
      update: {},
      create: { auth0Sub: customerAuth0Sub, role: 'customer', name: 'User' },
    });

    return this.prisma.job.create({
      data: {
        customerId: customer.id,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        photos: dto.photos ?? [],
        addressLine: dto.addressLine,
        lat: dto.lat,
        lng: dto.lng,
        scheduledStartAt: new Date(dto.scheduledStartAt),
        timeWindowMins: dto.timeWindowMins,
        budgetFixedCents: dto.budgetFixedCents,
      },
    });
  }

  async search(params: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    categoryId?: string;
  }) {
    return this.prisma.job.findMany({
      where: {
        status: 'open',
        ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: { acceptances: true, category: true },
    });
  }

  async accept(jobId: string, proAuth0Sub: string) {
    const pro = await this.prisma.user.upsert({
      where: { auth0Sub: proAuth0Sub },
      update: {},
      create: { auth0Sub: proAuth0Sub, role: 'pro', name: 'Pro' },
    });

    return this.prisma.jobAcceptance.create({
      data: {
        jobId,
        proId: pro.id,
        acceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        status: 'pending_customer',
      },
    });
  }

  async confirm(jobId: string, customerAuth0Sub: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { customer: true },
    });

    if (!job) throw new NotFoundException('Job not found');

    // Optional: verify request user actually owns this job
    if (job.customer?.auth0Sub !== customerAuth0Sub) {
      // you can throw ForbiddenException here if you wire customer relation
      throw new NotFoundException('You are not the customer for this job');
    }

    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'accepted' },
    });

    return { ok: true };
  }
}
