import { Controller, Get, Param, Query, ParseFloatPipe, ParseIntPipe } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  async findAll(
    @Query('marketplace') marketplace?: string,
    @Query('category') category?: string,
    @Query('minPrice', new ParseFloatPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseFloatPipe({ optional: true })) maxPrice?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.listingsService.findAll({ marketplace, category, minPrice, maxPrice, page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }
}
