import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('demo')
export class DemoController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getDemo(@Req() req: any) {
    return {
      message: 'Secure demo ok',
      user: req.user,
      job: {
        id: 'job_123',
        title: 'Paint a 10x12 room',
        budget: 120,
        city: 'Chicago',
        date: '2025-11-01',
        status: 'open',
      },
    };
  }
}
