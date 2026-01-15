import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';


@Injectable()
export class ReviewService{
    constructor(
        @InjectRepository(ReviewEntity)
        private reviewRepo: Repository<ReviewEntity>,
    ) {}
    
    async findAll(dto: GetReviewsDto)
    {
        const { menu_item_id, page = 1, limit = 10 } = dto;
        const skip = (page - 1) * limit;

        const query = this.reviewRepo.createQueryBuilder('review')
            .leftJoinAndSelect('review.menu_item', 'menu_item')
            .leftJoinAndSelect('review.user', 'user')
            .orderBy('review.created_at', 'DESC');
        
        if(menu_item_id)
        {
            // Filter trực tiếp trên bảng review sẽ an toàn và nhanh hơn
            query.where('review.menu_item_id = :menuItemId', { menuItemId: menu_item_id });
        }
        
        // Ép kiểu Number để tránh lỗi nếu DTO chưa transform
        query.skip(Number(skip)).take(Number(limit));

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }
    async findOne(id: string)
    {
        const review = await this.reviewRepo.findOne({ where: { id}});
        if(!review)
        {
            throw new NotFoundException('Review không tồn tại');
        }
        return review;
    }

   async create(createReviewDto: CreateReviewDto)
   {
        const review = this.reviewRepo.create(createReviewDto);
        return this.reviewRepo.save(review);
   }

    async getAverageRating(menuItemId: string): Promise<number> 
    {
        const result = await this.reviewRepo
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avg')
            .where('review.menu_item_id = :menuItemId', { menuItemId })
            .getRawOne();

        return result?.avg ? parseFloat(result.avg) : 0;
    }
}