import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findAll(@Query('menu_item_id') menuItemId?: string) {
    return this.reviewService.findAll(menuItemId);
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
}