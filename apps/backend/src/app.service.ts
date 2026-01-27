/**
 * App Service
 * Root application service
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Boilerplate Backend API - see /health or /api-docs for endpoints';
  }
}
