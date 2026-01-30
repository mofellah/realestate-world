/**
 * Messages Service
 * Handles all messaging-related API calls (send, inbox, threads, etc.)
 */

import { apiClient } from './api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject_line?: string;
  body: string;
  isRead: boolean;
  messageType: 'inquiry' | 'response';
  threadId?: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    email: string;
    name?: string;
  };
  recipient?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface MessageThread {
  threadId: string;
  participants: Array<{
    id: string;
    email: string;
  }>;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
}

export interface CreateMessageDto {
  recipientId: string;
  subject_line?: string;
  body: string;
  messageType?: 'inquiry' | 'response';
  threadId?: string;
  subjectId?: string;
}

export interface QueryMessagesDto {
  threadId?: string;
  isRead?: boolean;
  subjectId?: string;
  skip?: number;
  take?: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class MessagesService {
  /**
   * Send a new message
   */
  async sendMessage(data: CreateMessageDto): Promise<Message> {
    return apiClient.post<Message>('/messages', data);
  }

  /**
   * Get user's messages (inbox + sent)
   */
  async getMessages(params?: QueryMessagesDto): Promise<Message[]> {
    const queryString = new URLSearchParams();
    
    if (params?.threadId) queryString.append('threadId', params.threadId);
    if (params?.isRead !== undefined) queryString.append('isRead', params.isRead.toString());
    if (params?.subjectId) queryString.append('subjectId', params.subjectId);
    if (params?.skip !== undefined) queryString.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryString.append('take', params.take.toString());

    const query = queryString.toString();
    const endpoint = query ? `/messages?${query}` : '/messages';
    
    const response = await apiClient.get<{ messages: Message[]; total: number }>(endpoint);
    return response.messages || [];
  }

  /**
   * Get a single message by ID
   */
  async getMessage(id: string): Promise<Message> {
    return apiClient.get<Message>(`/messages/${id}`);
  }

  /**
   * Get all messages in a thread
   */
  async getMessageThread(threadId: string): Promise<MessageThread> {
    return apiClient.get<MessageThread>(`/messages/thread/${threadId}`);
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(id: string): Promise<Message> {
    return apiClient.patch<Message>(`/messages/${id}/read`, {});
  }

  /**
   * Get inbox (unread messages grouped by thread)
   */
  async getInbox(skip = 0, take = 20): Promise<Message[]> {
    const response = await apiClient.get<{ messages: Message[]; total: number }>(`/messages?isRead=false&skip=${skip}&take=${take}`);
    return response.messages || [];
  }
}

export const messagesService = new MessagesService();
