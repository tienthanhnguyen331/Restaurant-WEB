import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';


@Controller('api/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return await this.userService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() body) {
    return await this.userService.updateProfile(req.user.id, body);
  }
}
