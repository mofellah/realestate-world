import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AddAgentDto } from './dto/add-agent.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('agencies')
@Controller('agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new agency' })
  @ApiResponse({ status: 201, description: 'Agency created successfully' })
  @ApiResponse({ status: 400, description: 'Person must be an organization or agency already exists' })
  async create(@Request() req: any, @Body() createAgencyDto: CreateAgencyDto) {
    return this.agenciesService.create(req.user.sub, createAgencyDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get agency details (PUBLIC)' })
  @ApiResponse({ status: 200, description: 'Agency retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agency not found' })
  async findOne(@Param('id') id: string) {
    return this.agenciesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update agency (Admin only)' })
  @ApiResponse({ status: 200, description: 'Agency updated successfully' })
  @ApiResponse({ status: 403, description: 'Only agency admins can update' })
  @ApiResponse({ status: 404, description: 'Agency not found' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateAgencyDto: UpdateAgencyDto,
  ) {
    return this.agenciesService.update(id, req.user.sub, updateAgencyDto);
  }

  @Post(':id/agents')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add agent to agency (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Agent added successfully' })
  @ApiResponse({ status: 400, description: 'Max agents reached or user already an employee' })
  @ApiResponse({ status: 403, description: 'Only admins/managers can add agents' })
  async addAgent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() addAgentDto: AddAgentDto,
  ) {
    return this.agenciesService.addAgent(id, req.user.sub, addAgentDto);
  }

  @Delete(':id/agents/:agentUserId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove agent from agency (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Agent removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove last admin' })
  @ApiResponse({ status: 403, description: 'Only admins/managers can remove agents' })
  async removeAgent(
    @Request() req: any,
    @Param('id') id: string,
    @Param('agentUserId') agentUserId: string,
  ) {
    return this.agenciesService.removeAgent(id, req.user.sub, agentUserId);
  }

  @Get(':id/portfolio')
  @Public()
  @ApiOperation({ summary: 'Get agency property portfolio (PUBLIC)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Portfolio retrieved successfully' })
  async getPortfolio(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.agenciesService.getPortfolio(id, skip || 0, take || 20);
  }
}
