import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('healthz')
  ping() {
    return { ok: true, name: 'QuickFix API', uptime: process.uptime() };
  }
}
