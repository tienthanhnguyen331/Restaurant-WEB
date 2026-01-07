import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class ReviewEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column()
    menu_item_id: string;

    @Column({ type: 'int'})
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}