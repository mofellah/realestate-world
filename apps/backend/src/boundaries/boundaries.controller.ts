import { Controller, Get, Post, Body, Query, Param, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { BoundariesService } from "./boundaries.service";
import { SearchBoundariesDto } from "./dto/search-boundaries.dto";
import { AutocompleteBoundariesDto } from "./dto/autocomplete-boundaries.dto";

@ApiTags("boundaries")
@Controller("boundaries")
export class BoundariesController {
  private readonly logger = new Logger(BoundariesController.name);

  constructor(private readonly boundariesService: BoundariesService) {}

  @Get("autocomplete")
  @ApiOperation({ summary: "Autocomplete search for boundaries" })
  @ApiResponse({
    status: 200,
    description: "Returns matching boundaries sorted by relevance",
  })
  async autocomplete(@Query() dto: AutocompleteBoundariesDto) {
    this.logger.log(`Autocomplete: ${dto.query}`);
    return this.boundariesService.autocomplete(dto);
  }

  @Post("search")
  @ApiOperation({ summary: "Search boundaries with filters (POST for complex queries)" })
  @ApiBody({ type: SearchBoundariesDto })
  @ApiResponse({
    status: 200,
    description: "Returns matching boundaries with full details",
  })
  async search(@Body() dto: SearchBoundariesDto) {
    this.logger.log(`Search: ${JSON.stringify(dto)}`);
    return this.boundariesService.search(dto);
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular boundaries" })
  @ApiResponse({
    status: 200,
    description: "Returns popular boundaries sorted by rank",
  })
  async getPopular(@Query("country_code") country_code?: string) {
    this.logger.log(`Popular boundaries: ${country_code || "all countries"}`);
    return this.boundariesService.getPopular(country_code);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get boundary by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns boundary with full details including parent and children",
  })
  async findById(@Param("id") id: string) {
    this.logger.log(`Find by ID: ${id}`);
    return this.boundariesService.findById(id);
  }
}
