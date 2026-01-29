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
import { PropertiesService } from './properties.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@boilerplate/types';

@Controller('properties')
@UseGuards(JwtGuard)
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.create(user.sub, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.propertiesService.findByUser(user.sub, parseInt(skip || '0'), parseInt(take || '10'));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.propertiesService.delete(id, user.sub);
  }
}
