import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TablesModule } from './tables/tables.module';
import { QrAuthModule } from './qr-auth/qr-auth.module';
import { ExportsModule } from './modules/exports/exports.module';
import { GuestMenuModule } from './modules/guest-menu/guest-menu.module';
import { ModifierModule } from './modules/modifiers/modifiers.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { MenuCategoriesModule } from './modules/menu-categories/menu-categories.module';
import { MenuItemPhotosModule } from './modules/menu-item-photos/menu-item-photos.module';

import { Table } from './tables/table.entity';
import { MenuCategory } from './modules/menu-categories/entities/menu-category.entity';
import { MenuItem } from './modules/menu-items/entities/menu-item.entity';
import { MenuItemPhoto } from './modules/menu-item-photos/entities/menu-item-photo.entity';
import { ModifierGroup } from './modules/modifiers/entities/modifier-group.entity';
import { ModifierOption } from './modules/modifiers/entities/modifier-option.entity';
import { MenuItemModifierGroup } from './modules/modifiers/entities/menu-item-modifier-group.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [
          Table,
          MenuCategory,
          MenuItem,
          MenuItemPhoto,
          ModifierGroup,
          ModifierOption,
          MenuItemModifierGroup,
        ],
        synchronize: false, // Disable synchronize in production/serverless
        ssl: true, // Force SSL for Neon/Cloud DB
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      signOptions: { expiresIn: '1d' },
    }),

    TablesModule,
    QrAuthModule,
    ExportsModule,
    GuestMenuModule,
    ModifierModule,
    MenuItemsModule,
    MenuCategoriesModule, 
    MenuItemPhotosModule, 
  ],
})
export class AppModule {}