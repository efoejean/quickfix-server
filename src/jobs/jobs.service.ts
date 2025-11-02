import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerAuth0Sub: string, dto: any) {
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

  async search(params: { lat?: number; lng?: number; radiusKm?: number; categoryId?: string }) {
    // TODO: add Haversine later; MVP filters by status/category
    return this.prisma.job.findMany({
      where: { status: 'open', ...(params.categoryId ? { categoryId: params.categoryId } : {}) },
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
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min hold
        status: 'pending_customer',
      },
    });
  }

  async confirm(jobId: string, _customerAuth0Sub: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'accepted' },
    });

    return { ok: true };
  }
}
