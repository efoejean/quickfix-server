// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DemoController } from './demo.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { JobsService } from './jobs/jobs.service';
import { CategoriesService } from './categories/categories.service';
import { MessagesService } from './messages/messages.service';
import { JobsController } from './jobs/jobs.controller';
import { CategoriesController } from './categories/categories.controller';
import { MessagesController } from './messages/messages.controller';
import { HealthController } from './health.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 👇 This loads .env automatically and makes ConfigService available everywhere
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AdminModule,
  ],
  controllers: [
    DemoController,
    HealthController,
    JobsController,
    CategoriesController,
    MessagesController,
    UsersController, 
    
  ],
  providers: [
    PrismaService,
    JobsService,
    CategoriesService,
    MessagesService,
    UsersService,    
  ],
})
export class AppModule {}
