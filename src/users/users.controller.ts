// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  UnauthorizedException,NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpsertProProfileDto } from './dto/upsert-pro-profile.dto';

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

  // 🔐 All routes below require JWT
// src/users/users.controller.ts
@UseGuards(JwtAuthGuard)
@Get('me/pro-profile')
async getMyProProfile(@Req() req: Request) {
  const payload = (req as any).user as any;
  const user = await this.usersService.findByAuth0Sub(payload.sub);
  if (!user) throw new UnauthorizedException('User not found');

  const pro = await this.usersService.getProProfileForUser(user.id);

  if (!pro) {
    throw new NotFoundException('No pro profile'); // <-- ensures 404 with JSON body
  }

  return pro; // always JSON when present
}

  @UseGuards(JwtAuthGuard)
  @Post('me/pro-profile')
  async upsertMyProProfile(
    @Req() req: Request,
    @Body() dto: UpsertProProfileDto,
  ) {
    const payload = (req as any).user as any;

    const user = await this.usersService.findByAuth0Sub(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.upsertProProfileForUser(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/pro-profile/submit')
  async submitMyProProfile(@Req() req: Request) {
    const payload = (req as any).user as any;

    const user = await this.usersService.findByAuth0Sub(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.submitProProfileForUser(user.id);
  }
}
