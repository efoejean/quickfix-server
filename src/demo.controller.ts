// src/demo.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller()
export class DemoController {
  @UseGuards(AuthGuard('jwt')) // 👈 name must be 'jwt'
  @Get('demo')
  getDemo(@Req() req: Request) {
    return {
      message: '✅ Protected /demo route reached!',
      user: req.user,
    };
  }
}
