import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';


@Injectable()
export class ReviewService{
    constructor(
        @InjectRepository(ReviewEntity)
        private reviewRepo: Repository<ReviewEntity>,
    ) {}
    
    async findAll(menuItemId?: string)
    {
        const query = this.reviewRepo.createQueryBuilder('review').orderBy('review.created_at', 'DESC');
        if(menuItemId)
        {
            query.where('review.menu_item_id = :menuItemId', { menuItemId });
        }
        return query.getMany();
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