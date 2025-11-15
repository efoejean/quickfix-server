// src/admin/admin-pro-profiles.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ProVerificationStatus } from '@prisma/client';

@Controller('admin/pro-profiles')
@UseGuards(JwtAuthGuard)
export class AdminProProfilesController {
  constructor(private readonly usersService: UsersService) {}

  private async ensureAdmin(req: Request) {
    const payload = (req as any).user as any;
    const user = await this.usersService.findByAuth0Sub(payload.sub);
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access only');
    }
    return user;
  }

  // 🔎 GET /admin/pro-profiles?status=pending
  @Get()
  async list(
    @Req() req: Request,
    @Query('status') status?: ProVerificationStatus,
  ) {
    await this.ensureAdmin(req);
    return this.usersService.listProProfiles(status);
  }

  // ✅ PATCH /admin/pro-profiles/:id/verify
  @Patch(':id/verify')
  async verify(@Req() req: Request, @Param('id') id: string) {
    await this.ensureAdmin(req);
    return this.usersService.setProProfileStatus(id, ProVerificationStatus.verified);
  }

  // ❌ PATCH /admin/pro-profiles/:id/reject
  @Patch(':id/reject')
  async reject(@Req() req: Request, @Param('id') id: string) {
    await this.ensureAdmin(req);
    return this.usersService.setProProfileStatus(id, ProVerificationStatus.rejected);
  }
}
