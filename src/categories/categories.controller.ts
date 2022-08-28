import { Controller, Get, Query, Body, SetMetadata, UseGuards, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from '@nestjs/passport';
import { categories } from './categories.mock';
import { CreateCategoryDto } from './categories.types';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { Category } from './categories.schema';
import { CategoriesService } from './categories.service';

@ApiTags('Categories Module Api')
@ApiBearerAuth('JWT')
@SetMetadata('roles', 'admin')
@Controller('categories')

export class CategoriesController {

    constructor(
        private categoriesService: CategoriesService
    ) { }


    @Post()
    async addCategory(
        @Body() body: CreateCategoryDto,
        @GetCurrentUserId() userId: string
    ): Promise<Category> {
        return this.categoriesService.createCategory(body, userId);
    }

}