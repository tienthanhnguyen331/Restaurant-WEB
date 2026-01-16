import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user (legacy endpoint)
   * @deprecated Use /auth/signup instead
   */
  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string }) {
    return await this.authService.register(body);
  }

  /**
   * Sign up with email verification
   * @param signupDto User signup data
   * @returns Registration message with user info
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  /**
   * Verify email with token
   * Can be used via query parameter or request body
   * @param token Verification token from email link
   * @returns Verification success message
   */
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailGet(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  /**
   * Verify email via POST (alternative endpoint)
   * @param verifyEmailDto Verification token
   * @returns Verification success message
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailPost(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto.token);
  }

  /**
   * Login user
   * @param loginDto Email and password
   * @returns JWT access token and user info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Get authenticated user profile
   * @param user Current authenticated user
   * @returns User profile information
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}