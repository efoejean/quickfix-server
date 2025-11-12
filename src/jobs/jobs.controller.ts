import { Body, Controller, Get, Param, Post, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Request } from 'express';



@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

    // ✅ PUBLIC: anyone can see all jobs
@Get()
findAll() {
  return this.jobsService.findAll();
}

@UseGuards(JwtAuthGuard)
@Get('mine')
async findMine(@Req() req: Request) {
  const sub = (req as any).user.sub as string;
  return this.jobsService.findMine(sub);
}

  // 🔹 NEW: public job details
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
  const sub = req.user?.sub as string; // Auth0 subject
  return this.jobsService.create(sub, dto);
}

  // 🔍 Search open jobs (for pros)
  @Get()
  async search(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.jobsService.search({
      lat: Number(lat),
      lng: Number(lng),
      radiusKm: Number(radiusKm || 15),
      categoryId,
    });
  }

  // 📄 Get job details
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.jobsService.get(id);
  }
  
@UseGuards(JwtAuthGuard)
// 🤝 Pro accepts job
@Post(':id/accept')
async accept(@Req() req: Request, @Param('id') id: string) {
  console.log('➡️ POST /jobs/:id/accept called with id =', id);
  const proId = (req as any).user?.sub as string;
  console.log('➡️ Auth user sub =', proId);
  return this.jobsService.accept(id, proId);
}


@UseGuards(JwtAuthGuard)
  // ✅ Customer confirms job
  @Post(':id/confirm')
  async confirm(@Req() req: Request, @Param('id') id: string) {
    const customerId = req.user?.sub as string;
    return this.jobsService.confirm(id, customerId);
  }
}
