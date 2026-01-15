import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findAll(@Query() query: GetReviewsDto) {
    return this.reviewService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Post()
  create(@Body() createReviewDto: CreateReviewDto)
  {
    return this.reviewService.create(createReviewDto);
  }

  @Get('menu-item/:menuItemId/average-rating')
  async getAaverageRating(@Param('menuItemId') menuItemId: string)
  {
    const avg = await this.reviewService.getAverageRating(menuItemId);
    return { menu_item_id: menuItemId, average_rating: avg };
  }
}