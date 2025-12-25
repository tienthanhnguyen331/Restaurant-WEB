import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
// Dòng import đúng:
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from './dto/category.dto';

@Controller('admin/menu/categories')
export class MenuCategoriesController {
  constructor(private readonly categoriesService: MenuCategoriesService) {}

  @Get()
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Post()
  create(@Body() createDto: CreateMenuCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMenuCategoryDto) {
    return this.categoriesService.update(id, updateDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'active' | 'inactive') {
    return this.categoriesService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}