/**
 * App Controller
 * Root endpoint
 */

import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/auth.decorators';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
