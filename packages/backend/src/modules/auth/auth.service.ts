import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a secure random token for email verification
   */
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Calculate token expiration (24 hours from now)
   */
  private getTokenExpiration(): Date {
    const expirationHours = this.configService.get<number>(
      'EMAIL_VERIFICATION_EXPIRES_IN',
      24,
    );
    return new Date(Date.now() + expirationHours * 60 * 60 * 1000);
  }

  /**
   * Register a new user with email verification
   */
  async signup(data: { name: string; email: string; password: string }) {
    // Check if user already exists
    const existingUser = await this.userService.findOneByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.getTokenExpiration();

    // Create user (not verified)
    const user = await this.userService.create({
      ...data,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      // Send verification email
      const verificationLink = this.generateVerificationLink(verificationToken);
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationLink,
      );

      this.logger.log(
        `Signup successful for ${user.email}. Verification email sent.`,
      );

      return {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      // If email sending fails, delete the user
      await this.userService.delete(user.id);
      this.logger.error(`Failed to send verification email for ${user.email}`, error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    // Find user with this token
    const user = await this.userService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if token is still valid
    if (
      user.verificationTokenExpires &&
      new Date(user.verificationTokenExpires) < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark user as verified and clear the token
    await this.userService.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined,
    });

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${user.email}`, error);
    }

    this.logger.log(`Email verified successfully for ${user.email}`);

    return {
      message: 'Email verified successfully! Your account is now active.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: true,
      },
    };
  }

  /**
   * Login with email verification check
   */
  async login(data: { email: string; password: string }) {
    const user = await this.userService.findOneByEmail(data.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Legacy register method (for backward compatibility)
   */
  async register(data: { name: string; email: string; password: string }) {
    return this.signup(data);
  }

  /**
   * Generate verification link
   */
  private generateVerificationLink(token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    return `${frontendUrl}/api/auth/verify-email?token=${token}`;
  }
}