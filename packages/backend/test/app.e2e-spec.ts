import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { MenuItemsModule } from '../src/modules/menu-items/menu-items.module';
import { MenuCategoriesModule } from '../src/modules/menu-categories/menu-categories.module';
import { ModifierModule } from '../src/modules/modifiers/modifiers.module';

import { MenuCategoryEntity } from '../src/modules/menu-categories/entities/menu-category.entity';
import { MenuItemEntity } from '../src/modules/menu-items/entities/menu-item.entity';
import { MenuItemPhotoEntity } from '../src/modules/menu-item-photos/entities/menu-item-photo.entity';
import { ModifierGroupEntity } from '../src/modules/modifiers/entities/modifier-group.entity';
import { ModifierOptionEntity } from '../src/modules/modifiers/entities/modifier-option.entity';
import { MenuItemModifierGroupEntity } from '../src/modules/modifiers/entities/menu-item-modifier-group.entity';

describe('MenuItems (e2e)', () => {
	let app: INestApplication;

	const restaurantId = '00000000-0000-0000-0000-000000000000';

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					type: 'sqlite',
					database: ':memory:',
					dropSchema: true,
					synchronize: true,
					entities: [
						MenuCategoryEntity,
						MenuItemEntity,
						MenuItemPhotoEntity,
						ModifierGroupEntity,
						ModifierOptionEntity,
						MenuItemModifierGroupEntity,
					],
				}),
				MenuCategoriesModule,
				ModifierModule,
				MenuItemsModule,
			],
		}).compile();

		app = moduleRef.createNestApplication();
		app.setGlobalPrefix('api');
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	async function seedCategory(name: string, status: 'active' | 'inactive' = 'active') {
		const repo = app.get(getRepositoryToken(MenuCategoryEntity)) as any;
		return await repo.save({
			restaurantId,
			name,
			description: null,
			displayOrder: 0,
			status,
			isDeleted: false,
		});
	}

	it('POST create item -> 201', async () => {
		const cat = await seedCategory('Pizza');

		const res = await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({
				categoryId: cat.id,
				name: 'Margherita',
				price: 9.99,
				prepTimeMinutes: 10,
				status: 'available',
				isChefRecommended: true,
			})
			.expect(201);

		expect(res.body.id).toBeDefined();
		expect(res.body.name).toBe('Margherita');
		expect(res.body.price).toBe(9.99);
	});

	it('GET list supports filters/sort/paging', async () => {
		const catA = await seedCategory('A');
		const catB = await seedCategory('B');

		const create = (payload: any) =>
			request(app.getHttpServer()).post('/api/admin/menu/items').send(payload).expect(201);

		await create({ categoryId: catA.id, name: 'Apple', price: 5, status: 'available', isChefRecommended: true });
		await create({ categoryId: catA.id, name: 'Avocado', price: 7, status: 'sold_out', isChefRecommended: false });
		await create({ categoryId: catB.id, name: 'Banana', price: 3, status: 'available', isChefRecommended: false });

		const res1 = await request(app.getHttpServer())
			.get('/api/admin/menu/items')
			.query({ q: 'a', sort: 'price', order: 'ASC', page: 1, limit: 2 })
			.expect(200);

		expect(res1.body.data.length).toBe(2);
		expect(res1.body.total).toBeGreaterThanOrEqual(3);
		expect(res1.body.page).toBe(1);
		expect(res1.body.limit).toBe(2);
		expect(res1.body.data[0].price).toBeLessThanOrEqual(res1.body.data[1].price);

		const res2 = await request(app.getHttpServer())
			.get('/api/admin/menu/items')
			.query({ categoryId: catA.id, status: 'sold_out' })
			.expect(200);

		expect(res2.body.data.length).toBe(1);
		expect(res2.body.data[0].name).toBe('Avocado');

		const res3 = await request(app.getHttpServer())
			.get('/api/admin/menu/items')
			.query({ chefRecommended: true })
			.expect(200);
		expect(res3.body.data.some((i: any) => i.name === 'Apple')).toBe(true);
	});

	it('PUT update allows moving category', async () => {
		const cat1 = await seedCategory('C1');
		const cat2 = await seedCategory('C2', 'inactive');

		const created = await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat1.id, name: 'MoveMe', price: 10, status: 'available' })
			.expect(201);

		const updated = await request(app.getHttpServer())
			.put(`/api/admin/menu/items/${created.body.id}`)
			.send({ categoryId: cat2.id, name: 'Moved' })
			.expect(200);

		expect(updated.body.name).toBe('Moved');
		expect(updated.body.categoryId).toBe(cat2.id);
	});

	it('PATCH status updates only status', async () => {
		const cat = await seedCategory('S');
		const created = await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat.id, name: 'StatusItem', price: 10, status: 'available' })
			.expect(201);

		const updated = await request(app.getHttpServer())
			.patch(`/api/admin/menu/items/${created.body.id}/status`)
			.send({ status: 'sold_out' })
			.expect(200);

		expect(updated.body.status).toBe('sold_out');
	});

	it('DELETE soft deletes and item disappears from list', async () => {
		const cat = await seedCategory('D');
		const created = await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat.id, name: 'DeleteMe', price: 10, status: 'available' })
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/api/admin/menu/items/${created.body.id}`)
			.expect(204);

		const list = await request(app.getHttpServer())
			.get('/api/admin/menu/items')
			.expect(200);

		expect(list.body.data.some((i: any) => i.id === created.body.id)).toBe(false);

		await request(app.getHttpServer())
			.get(`/api/admin/menu/items/${created.body.id}`)
			.expect(404);
	});

	it('validation: invalid price/prepTime/status -> 400', async () => {
		const cat = await seedCategory('V');

		await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat.id, name: 'Bad', price: 0, status: 'available' })
			.expect(400);

		await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat.id, name: 'Bad2', price: 10, prepTimeMinutes: 999, status: 'available' })
			.expect(400);

		await request(app.getHttpServer())
			.post('/api/admin/menu/items')
			.send({ categoryId: cat.id, name: 'Bad3', price: 10, status: 'nope' })
			.expect(400);
	});
});

