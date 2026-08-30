import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.service.getDashboard();
  }
}