import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { MenuItemEntity } from '../../menu-items/entities/menu-item.entity';

@Entity('reviews')
export class ReviewEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column()
    menu_item_id: string;

    @ManyToOne(() => MenuItemEntity)
    @JoinColumn({ name: 'menu_item_id' })
    menu_item: MenuItemEntity;

    @Column({ type: 'int'})
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}