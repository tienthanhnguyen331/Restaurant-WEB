import { Controller, Get, UseGuards, Put, Param, Body, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	@Roles(UserRole.ADMIN)
	async getAllUsersForAdmin() {
		// Không trả về password, avatar, provider...
		const users = await this.userService.findAllForAdmin();
		// Đổi name -> username cho đúng format frontend
		return users.map((u) => ({
			id: u.id,
			username: u.name,
			email: u.email,
			role: u.role,
			isActive: true, // Hiện tại luôn true vì không có cột trạng thái
			createdAt: u.createdAt,
			password: u.password,
		}));
	}
	@Put(':id')
	@Roles(UserRole.ADMIN)
	async updateUserByAdmin(
		@Param('id') id: string,
		@Body() body: { username: string; email: string; role: string }
	) {
		return this.userService.updateUserByAdmin(id, body);
	}


	@Post()
	@Roles(UserRole.ADMIN)
	async createUserByAdmin(
		@Body() body: { username: string; email: string; password: string; role: string }
	) {
		return this.userService.createUserByAdmin(body);
	}
}
