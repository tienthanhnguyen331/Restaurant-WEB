import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string; // Từ fix trước
}

/**
 * Decorator để lấy thông tin user đã authenticated từ request
 * Sử dụng sau khi request đã pass qua JwtAuthGuard
 * 
 * @example
 * async getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   // user.sub is user id
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (request as any).user;

    return data ? user?.[data] : user;
  },
);
