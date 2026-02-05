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
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PropertiesService } from "./properties.service";
import { PropertyUseCasesService } from "../use-cases/property.use-cases.service";
import { OwnerContactUseCasesService } from "../use-cases/owner-contact.use-cases.service";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ContactOwnerDto } from "./dto/contact-owner.dto";
import { Public } from "../auth/decorators/auth.decorators";
import { JwtPayload } from "@boilerplate/types";
import { CreatePropertyDto, UpdatePropertyDto } from "./dto/property.dto";
import { SearchPropertiesDto } from "./dto/search-properties.dto";

@ApiTags("Properties")
@Controller("properties")
@UseGuards(JwtGuard)
@ApiBearerAuth("JWT-auth")
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private propertyUseCases: PropertyUseCasesService,
    private ownerContactUseCases: OwnerContactUseCasesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new property" })
  @ApiResponse({ status: 201, description: "Property created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() dto: CreatePropertyDto, @CurrentUser() user: JwtPayload) {
    return this.propertyUseCases.create(user.sub, dto);
  }

  @Post("search")
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60 * 1000 } })
  @ApiOperation({
    summary: "Search properties with complex filters (PUBLIC, POST for arrays/objects)",
  })
  @ApiResponse({ status: 200, description: "Properties retrieved successfully" })
  @ApiResponse({ status: 429, description: "Too many search requests" })
  async search(@Body() filters: SearchPropertiesDto) {
    return this.propertyUseCases.search(filters);
  }

  @Post(":id/contact")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Contact property owner" })
  @ApiParam({ name: "id", description: "Property ID" })
  @ApiResponse({ status: 201, description: "Message sent successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async contactOwner(
    @Param("id") id: string,
    @Body() dto: ContactOwnerDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ownerContactUseCases.contactOwner(user.sub, id, dto);
  }

  @Get()
  @Throttle({ default: { limit: 100, ttl: 15 * 60 * 1000 } })
  @ApiOperation({ summary: "Get all properties for the authenticated user" })
  @ApiQuery({ name: "skip", required: false, type: Number, description: "Skip N properties" })
  @ApiQuery({ name: "take", required: false, type: Number, description: "Take N properties" })
  @ApiResponse({ status: 200, description: "Properties retrieved successfully" })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    return this.propertiesService.findByUser(
      user.sub,
      parseInt(skip || "0"),
      parseInt(take || "10"),
    );
  }

  @Get(":id")
  @Public()
  @Throttle({ default: { limit: 100, ttl: 15 * 60 * 1000 } })
  @ApiOperation({ summary: "Get a property by ID (PUBLIC)" })
  @ApiParam({ name: "id", description: "Property ID" })
  @ApiResponse({ status: 200, description: "Property retrieved successfully" })
  @ApiResponse({ status: 404, description: "Property not found" })
  async findOne(@Param("id") id: string) {
    return this.propertiesService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a property" })
  @ApiParam({ name: "id", description: "Property ID" })
  @ApiResponse({ status: 200, description: "Property updated successfully" })
  @ApiResponse({ status: 403, description: "Not the property owner" })
  @ApiResponse({ status: 404, description: "Property not found" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.propertiesService.update(id, user.sub, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a property" })
  @ApiParam({ name: "id", description: "Property ID" })
  @ApiResponse({ status: 204, description: "Property deleted successfully" })
  @ApiResponse({ status: 403, description: "Not the property owner" })
  @ApiResponse({ status: 404, description: "Property not found" })
  async delete(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    await this.propertiesService.delete(id, user.sub);
  }
}
