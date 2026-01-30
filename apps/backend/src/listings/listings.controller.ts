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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@boilerplate/types';
import { CreateListingDto, UpdateListingDto, PublishListingDto } from './dto/listing.dto';

@ApiTags('Listings')
@Controller('listings')
@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new listing' })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Not the property owner' })
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: JwtPayload) {
    return this.listingsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all listings for the authenticated user' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip N listings' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Take N listings' })
  @ApiResponse({ status: 200, description: 'Listings retrieved successfully' })
  async findAll(@CurrentUser() user: JwtPayload, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.listingsService.findByUser(user.sub, parseInt(skip || '0'), parseInt(take || '10'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a listing by ID' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Listing retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findOne(@Param('id') id: string) {
    return this.listingsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a listing (status, visibility)' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the listing creator' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto, @CurrentUser() user: JwtPayload) {
    return this.listingsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 204, description: 'Listing deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the listing creator' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.delete(id, user.sub);
  }
}
