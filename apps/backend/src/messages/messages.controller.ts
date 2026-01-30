import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Recipient or subject not found' })
  async create(@Request() req: any, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.sub, createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages for authenticated user (inbox + sent)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async findAll(@Request() req: any, @Query() query: QueryMessagesDto) {
    return this.messagesService.findAll(req.user.sub, query);
  }

  @Get('thread/:threadId')
  @ApiOperation({ summary: 'Get all messages in a conversation thread' })
  @ApiResponse({ status: 200, description: 'Thread retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found or access denied' })
  async findThread(@Request() req: any, @Param('threadId') threadId: string) {
    return this.messagesService.findThread(threadId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this message' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.findOne(id, req.user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 403, description: 'Only recipient can mark as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.messagesService.markAsRead(id, req.user.sub);
    return { message: 'Message marked as read' };
  }
}
