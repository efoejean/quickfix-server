// src/jobs/jobs.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Request } from 'express';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ✅ PUBLIC: list or search jobs
  @Get()
  async listOrSearch(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const hasSearchParams =
      lat !== undefined || lng !== undefined || categoryId !== undefined;

    if (hasSearchParams) {
      return this.jobsService.search({
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radiusKm: radiusKm ? Number(radiusKm) : 15,
        categoryId,
      });
    }

    return this.jobsService.findAll();
  }

  // 👤 Customer's own jobs
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async findMine(@Req() req: Request) {
    const sub = (req as any).user.sub as string;
    return this.jobsService.findMine(sub);
  }

  // 🧑‍🔧 Pro – jobs où je suis pro
  @UseGuards(JwtAuthGuard)
  @Get('aspro')
  async findAsPro(@Req() req: Request) {
    const sub = (req as any).user.sub as string;
    return this.jobsService.findAsPro(sub);
  }

  // 📄 PUBLIC: Get job details
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const job = await this.jobsService.get(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  // 🧱 Create a new job (customer only)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateJobDto) {
    const sub = (req as any).user.sub as string;
    return this.jobsService.create(sub, dto);
  }

  // 🤝 Pro accepts job
  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  async accept(@Req() req: Request, @Param('id') id: string) {
    const proSub = (req as any).user?.sub as string;
    return this.jobsService.accept(id, proSub);
  }

  // ✅ Customer confirms job
  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id') id: string) {
    const customerSub = (req as any).user?.sub as string;
    return this.jobsService.confirm(id, customerSub);
  }

  // 🚀 Pro démarre le job
  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async start(@Req() req: Request, @Param('id') id: string) {
    const proSub = (req as any).user?.sub as string;
    return this.jobsService.start(id, proSub);
  }

  // ✅ Pro termine le job
  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async complete(@Req() req: Request, @Param('id') id: string) {
    const proSub = (req as any).user?.sub as string;
    return this.jobsService.complete(id, proSub);
  }
}
