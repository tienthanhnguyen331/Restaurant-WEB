export const createAdminUser = async (
	token: string,
	user: { username: string; email: string; password: string; role: string }
): Promise<UserAdmin> => {
	const { data } = await api.post<UserAdmin>('/admin/users', user, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return data;
};


import axios from 'axios';
import type { UserAdmin } from '../types/user.type';

const api = axios.create({
	baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
});


export const fetchAdminUsers = async (token: string): Promise<UserAdmin[]> => {
	const { data } = await api.get<UserAdmin[]>('/admin/users', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return data;
};

export const updateAdminUser = async (
	token: string,
	userId: string,
	update: { username: string; email: string; role: string }
): Promise<UserAdmin> => {
	const { data } = await api.put<UserAdmin>(`/admin/users/${userId}`, update, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return data;
};
