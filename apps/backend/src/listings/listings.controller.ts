import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@boilerplate/types';

@Controller('listings')
@UseGuards(JwtGuard)
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.listingsService.create(user.sub, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.listingsService.findByUser(user.sub, parseInt(skip || '0'), parseInt(take || '10'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.listingsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.delete(id, user.sub);
  }
}
