/**
 * Owner Contact Use-Case
 * Centralizes owner contact workflow
 */

import { Injectable, BadRequestException } from "@nestjs/common";
import { PropertiesService } from "../properties/properties.service";
import { MessagesService } from "../messages/messages.service";
import type { ContactOwnerDto } from "../properties/dto/contact-owner.dto";

@Injectable()
export class OwnerContactUseCasesService {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly messagesService: MessagesService,
  ) {}

  async contactOwner(senderId: string, propertyId: string, dto: ContactOwnerDto) {
    const property = await this.propertiesService.findById(propertyId);
    const ownerUserId = (property as any)?.user?.id || (property as any)?.userId;

    if (!ownerUserId) {
      throw new BadRequestException("Property owner not found");
    }

    if (ownerUserId === senderId) {
      throw new BadRequestException("You cannot contact yourself about your property");
    }

    return this.messagesService.create(senderId, {
      recipientId: ownerUserId,
      subject_line: dto.subjectLine,
      body: dto.body,
      messageType: "inquiry",
    });
  }
}
