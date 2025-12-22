import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Admin Authentication Guard
 * TODO: Implement full JWT authentication với session/token
 * 
 * Hiện tại sử dụng placeholder logic để cho phép testing
 * Khi triển khai đầy đủ:
 * 1. Verify JWT token từ header Authorization
 * 2. Decode user info (userId, restaurantId, role)
 * 3. Kiểm tra role = 'admin'
 * 4. Gắn user info vào request
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // TODO: Implement JWT verification
    // const token = this.extractTokenFromHeader(request);
    // if (!token) {
    //   throw new UnauthorizedException('Token không được cung cấp');
    // }
    
    // const payload = await this.jwtService.verifyAsync(token);
    // if (payload.role !== 'admin') {
    //   throw new UnauthorizedException('Chỉ admin mới có quyền truy cập');
    // }
    
    // Gắn user info vào request (placeholder data cho testing)
    request.user = {
      userId: '00000000-0000-0000-0000-000000000001',
      restaurantId: '00000000-0000-0000-0000-000000000000',
      role: 'admin',
    };

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
