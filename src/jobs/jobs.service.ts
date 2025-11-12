import { Injectable, NotFoundException , ForbiddenException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Role } from '@prisma/client'; 

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
      create: { auth0Sub: customerAuth0Sub, role: Role.customer,  name: 'User' },
    });

    return this.prisma.job.create({
      data: {
        customerId: customer.id,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        photos: dto.photos ?? [],
        addressLine: dto.addressLine,
        lat: dto.lat ?? 0,
        lng: dto.lng ?? 0,
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
  // 1. Check job exists
  const job = await this.prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job) throw new NotFoundException('Job not found');

  // 2. Load user by auth0Sub + proProfile
  const user = await this.prisma.user.findUnique({
    where: { auth0Sub: proAuth0Sub },
    include: { proProfile: true },
  });

  if (!user) {
    throw new ForbiddenException(
      'You need a QuickFix account before you can accept jobs.',
    );
  }

  if (!user.proProfile || user.proProfile.verificationStatus !== 'verified') {
    throw new ForbiddenException(
      'You must have a verified pro account to accept jobs.',
    );
  }

  if (job.customerId === user.id) {
    throw new ForbiddenException('You cannot accept your own job');
  }

  const alreadyAccepted = await this.prisma.jobAcceptance.findFirst({
    where: {
      jobId,
      proId: user.id,
    },
  });
  if (alreadyAccepted) {
    throw new ForbiddenException('You have already offered to take this job.');
  }

  return this.prisma.jobAcceptance.create({
    data: {
      jobId,
      proId: user.id,
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

  async findMine(customerAuth0Sub: string) {
  return this.prisma.job.findMany({
    where: {
      customer: {
        auth0Sub: customerAuth0Sub,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}



}
