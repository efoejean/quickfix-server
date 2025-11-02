import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Request } from 'express';


@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  // 🧱 Create a new job (customer only)
  @Post()
async create(@Req() req: Request, @Body() dto: CreateJobDto) {
  const sub = req.user?.sub as string; // Auth0 subject
  return this.jobs.create(sub, dto);
}

  // 🔍 Search open jobs (for pros)
  @Get()
  async search(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.jobs.search({
      lat: Number(lat),
      lng: Number(lng),
      radiusKm: Number(radiusKm || 15),
      categoryId,
    });
  }

  // 📄 Get job details
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.jobs.get(id);
  }

  // 🤝 Pro accepts job
  @Post(':id/offer')
  async accept(@Req() req: Request, @Param('id') id: string) {
    const proId = req.user?.sub as string;
    return this.jobs.accept(id, proId);
  }

  // ✅ Customer confirms job
  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id') id: string) {
    const customerId = req.user?.sub as string;
    return this.jobs.confirm(id, customerId);
  }
}
