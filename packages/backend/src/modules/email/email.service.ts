import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationLink: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@restaurant.com'),
        to: email,
        subject: 'Verify Your Email - Restaurant App',
        html: this.getVerificationEmailTemplate(name, verificationLink),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@restaurant.com'),
        to: email,
        subject: 'Welcome to Restaurant App',
        html: this.getWelcomeEmailTemplate(name),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private getVerificationEmailTemplate(name: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #ff6b6b;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #ff6b6b;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restaurant App - Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for signing up! To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
            
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p><code>${verificationLink}</code></p>
            
            <div class="warning">
              <strong>⏰ Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>Access your account</li>
              <li>Browse our menu</li>
              <li>Place orders</li>
              <li>Track your dining history</li>
            </ul>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Best regards,<br><strong>Restaurant App Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Restaurant App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Restaurant App! ✅</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your email has been successfully verified! Your account is now active and ready to use.</p>
            
            <p>You can now:</p>
            <ul>
              <li>✅ Log in to your account</li>
              <li>✅ Browse our delicious menu</li>
              <li>✅ Place and track orders</li>
              <li>✅ Leave reviews and ratings</li>
            </ul>
            
            <p>Thank you for joining us. We look forward to serving you!</p>
            
            <p>Best regards,<br><strong>Restaurant App Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Restaurant App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendResetPasswordEmail(
    email: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@restaurant.com'),
        to: email,
        subject: 'Reset Your Password - Restaurant App',
        html: this.getResetPasswordEmailTemplate(name, resetLink),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  private getResetPasswordEmailTemplate(name: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #ff6b6b;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #ff6b6b;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
          }
          .warning {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .code-block {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            word-break: break-all;
            font-family: monospace;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the link below:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <div class="code-block">${resetLink}</div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This reset link will expire in 15 minutes for security reasons. If the link has expired, you can request a new one.
            </div>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Never share your reset link with anyone</li>
              <li>Make sure your new password is strong and unique</li>
              <li>If you didn't request this, your account may be at risk - change your password immediately</li>
            </ul>
            
            <p>If you have any questions or didn't request a password reset, please contact our support team.</p>
            
            <p>Best regards,<br><strong>Restaurant App Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Restaurant App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
