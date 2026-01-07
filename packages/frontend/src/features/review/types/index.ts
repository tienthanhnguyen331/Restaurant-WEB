export interface Review {
    id: string;
    user_id: string;
    menu_item_id: string;
    rating: number;
    comment?: string;
    created_at: Date;
}
