export interface UserAdmin {
	id: string;
	username: string;
	email: string;
	role: 'ADMIN' | 'WAITER' | 'KITCHEN' | 'USER';
	isActive: boolean;
	createdAt: string;
}
