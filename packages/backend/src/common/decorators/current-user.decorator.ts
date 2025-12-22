import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  restaurantId: string;
  role: string;
}

/**
 * Decorator để lấy thông tin user đã authenticated từ request
 * Sử dụng sau khi request đã pass qua AdminAuthGuard
 * 
 * @example
 * async createItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateItemDto) {
 *   // user.restaurantId available here
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
