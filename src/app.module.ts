import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';

import { PrismaService } from './prisma/prisma.service';
import { JobsService } from './jobs/jobs.service';
import { CategoriesService } from './categories/categories.service';
import { MessagesService } from './messages/messages.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JobsController } from './jobs/jobs.controller';
import { CategoriesController } from './categories/categories.controller';
import { MessagesController } from './messages/messages.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [DemoController,HealthController,JobsController, CategoriesController, MessagesController],
  providers: [PrismaService, JobsService, CategoriesService, MessagesService, JwtStrategy],
})
export class AppModule {}
