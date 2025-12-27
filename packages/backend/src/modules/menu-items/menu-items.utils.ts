import type { CategoryStatus, MenuItemStatus } from '../../shared/types/menu';

export interface NormalizedMenuItemQuery {
  q?: string;
  categoryId?: string;
  status?: MenuItemStatus;
  chefRecommended?: boolean;
  sort: 'createdAt' | 'price' | 'popularity';
  order: 'ASC' | 'DESC';
  page: number;
  limit: number;
  offset: number;
}

export function normalizeMenuItemQuery(input: {
  q?: string;
  categoryId?: string;
  status?: MenuItemStatus;
  chefRecommended?: boolean;
  sort?: 'createdAt' | 'price' | 'popularity';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}): NormalizedMenuItemQuery {
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 100);
  const sort = input.sort ?? 'createdAt';
  const order = (input.order ?? 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  return {
    q: input.q,
    categoryId: input.categoryId,
    status: input.status,
    chefRecommended: input.chefRecommended,
    sort,
    order,
    page,
    limit,
    offset,
  };
}

export function isGuestItemVisible(args: {
  categoryStatus: CategoryStatus;
  itemStatus: MenuItemStatus;
  itemIsDeleted: boolean;
}): boolean {
  return args.categoryStatus === 'active' && args.itemStatus === 'available' && !args.itemIsDeleted;
}
