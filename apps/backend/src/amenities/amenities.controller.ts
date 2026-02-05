import { Controller, Get, Post, Body, Query, Param, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AmenitiesService } from "./amenities.service";
import { SearchAmenitiesDto } from "./dto/search-amenities.dto";
import { AutocompleteAmenitiesDto } from "./dto/autocomplete-amenities.dto";
import { AmenityTypeEnum } from "@prisma/client";

@ApiTags("amenities")
@Controller("amenities")
export class AmenitiesController {
  private readonly logger = new Logger(AmenitiesController.name);

  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get("autocomplete")
  @ApiOperation({ summary: "Autocomplete search for amenities" })
  @ApiResponse({
    status: 200,
    description: "Returns matching amenities sorted by name",
  })
  async autocomplete(@Query() dto: AutocompleteAmenitiesDto) {
    this.logger.log(`Autocomplete: ${dto.query}`);
    return this.amenitiesService.autocomplete(dto);
  }

  @Post("search")
  @ApiOperation({
    summary: "Search amenities with filters and proximity (POST for complex queries)",
  })
  @ApiBody({ type: SearchAmenitiesDto })
  @ApiResponse({
    status: 200,
    description: "Returns matching amenities with location data",
  })
  async search(@Body() dto: SearchAmenitiesDto) {
    this.logger.log(`Search: ${JSON.stringify(dto)}`);
    return this.amenitiesService.search(dto);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get amenity statistics by type" })
  @ApiResponse({
    status: 200,
    description: "Returns count of amenities per type",
  })
  async getStatistics() {
    this.logger.log("Get statistics");
    return this.amenitiesService.getStatistics();
  }

  @Get("type/:type")
  @ApiOperation({ summary: "Get amenities by type" })
  @ApiResponse({
    status: 200,
    description: "Returns all amenities of the specified type",
  })
  async findByType(@Param("type") type: AmenityTypeEnum) {
    this.logger.log(`Find by type: ${type}`);
    return this.amenitiesService.findByType(type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get amenity by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns amenity with full details",
  })
  async findById(@Param("id") id: string) {
    this.logger.log(`Find by ID: ${id}`);
    return this.amenitiesService.findById(id);
  }
}
