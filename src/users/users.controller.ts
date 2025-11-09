// src/users/users.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const payload = (req as any).user as any;

    // headers from frontend (may be undefined)
    const emailHeader =
      (req.headers['x-user-email'] as string | undefined)?.trim() || undefined;
    const nameHeader =
      (req.headers['x-user-name'] as string | undefined)?.trim() || undefined;

    return this.usersService.upsertFromAuth0(payload.sub, {
      name: nameHeader ?? payload.name,
      email: emailHeader ?? payload.email,
    });
  }
}
