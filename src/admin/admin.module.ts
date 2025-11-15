// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AdminProProfilesController } from './admin-pro-profiles.controller';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminJobsController } from './admin-jobs.controller';

@Module({
  controllers: [AdminJobsController,AdminProProfilesController],
  providers: [UsersService, PrismaService],
})
export class AdminModule {}
