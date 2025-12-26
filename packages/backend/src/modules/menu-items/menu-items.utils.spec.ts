import { isGuestItemVisible, normalizeMenuItemQuery } from './menu-items.utils';

describe('menu-items.utils', () => {
  describe('normalizeMenuItemQuery', () => {
    it('applies defaults and clamps values', () => {
      const q = normalizeMenuItemQuery({ page: 0, limit: 999, order: 'ASC' });
      expect(q.page).toBe(1);
      expect(q.limit).toBe(100);
      expect(q.order).toBe('ASC');
      expect(q.sort).toBe('createdAt');
      expect(q.offset).toBe(0);
    });

    it('computes offset', () => {
      const q = normalizeMenuItemQuery({ page: 3, limit: 10 });
      expect(q.offset).toBe(20);
    });
  });

  describe('isGuestItemVisible', () => {
    it('returns true only when category active, item available, not deleted', () => {
      expect(
        isGuestItemVisible({ categoryStatus: 'active', itemStatus: 'available', itemIsDeleted: false }),
      ).toBe(true);

      expect(
        isGuestItemVisible({ categoryStatus: 'inactive', itemStatus: 'available', itemIsDeleted: false }),
      ).toBe(false);

      expect(
        isGuestItemVisible({ categoryStatus: 'active', itemStatus: 'sold_out', itemIsDeleted: false }),
      ).toBe(false);

      expect(
        isGuestItemVisible({ categoryStatus: 'active', itemStatus: 'available', itemIsDeleted: true }),
      ).toBe(false);
    });
  });
});
