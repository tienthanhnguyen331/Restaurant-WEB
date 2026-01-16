import React, { useEffect, useState } from 'react';
import UserTable from '../components/UserTable';
import { fetchAdminUsers, createAdminUser } from '../services/adminUserApi';
import type { UserAdmin } from '../types/user.type';
import { getCurrentUser, getAccessTokenByRole } from '../../../features/auth/hooks/useAuth';


const ROLES = ['ADMIN', 'WAITER', 'KITCHEN', 'USER'];

const AccountManagementPage: React.FC = () => {
		const [showCreate, setShowCreate] = useState(false);
		const [createData, setCreateData] = useState({ username: '', email: '', password: '', role: 'USER' });
		const [creating, setCreating] = useState(false);
		const [createError, setCreateError] = useState<string | null>(null);
	const [users, setUsers] = useState<UserAdmin[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('ALL');

	useEffect(() => {
		const user = getCurrentUser();
		if (!user || user.role !== 'ADMIN') {
			setError('403 - Không có quyền truy cập');
			setLoading(false);
			setTimeout(() => {
				window.location.href = '/403';
			}, 1500);
			return;
		}
		const token = getAccessTokenByRole('ADMIN');
		if (!token) {
			setError('Vui lòng đăng nhập lại');
			setLoading(false);
			setTimeout(() => {
				window.location.href = '/login';
			}, 1500);
			return;
		}
		fetchAdminUsers(token)
			.then(setUsers)
			.catch((e) => setError(e?.response?.data?.message || 'Lỗi tải dữ liệu'))
			.finally(() => setLoading(false));
	}, []);

	// Filter users theo tên và role
	const filteredUsers = users.filter((u) => {
		const matchName = u.username.toLowerCase().includes(search.toLowerCase());
		const matchRole = role === 'ALL' || u.role === role;
		return matchName && matchRole;
	});

	return (
		<div>
			<h2 className="text-3xl font-bold text-gray-900">Quản lý tài khoản</h2>
			<div style={{ display: 'flex', gap: 12, margin: '16px 0', alignItems: 'center' }}>
				<input
					type="text"
					placeholder="Tìm kiếm theo tên..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', minWidth: 220 }}
				/>
				<select
					value={role}
					onChange={e => setRole(e.target.value)}
					style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
				>
					<option value="ALL">Tất cả vai trò</option>
					{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
				</select>
				<button
					onClick={() => { setShowCreate(true); setCreateData({ username: '', email: '', password: '', role: 'USER' }); setCreateError(null); }}
					style={{
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						background: '#4ade80', color: '#065f46', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, fontSize: 18, cursor: 'pointer',
					}}
					title="Tạo tài khoản mới"
				>
					<span style={{ fontSize: 22, marginRight: 4 }}>+</span> Thêm
				</button>
			</div>
			<UserTable users={filteredUsers} loading={loading} error={error} />

			{/* Modal tạo tài khoản */}
			{showCreate && (
				<div style={{
					position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0005', zIndex: 1000,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
				}}>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							setCreating(true);
							setCreateError(null);
							const token = getAccessTokenByRole('ADMIN');
							if (!token) {
								setCreateError('Vui lòng đăng nhập lại');
								setCreating(false);
								return;
							}
							try {
								await createAdminUser(token, createData);
								window.location.reload();
							} catch (err: any) {
								let msg = err?.response?.data?.message || 'Lỗi tạo tài khoản';
								if (typeof msg === 'string' && msg.toLowerCase().includes('email đã tồn tại')) {
									msg = 'Email này đã được sử dụng, vui lòng chọn email khác.';
								}
								setCreateError(msg);
							} finally {
								setCreating(false);
							}
						}}
						style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0002' }}
					>
						<h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Tạo tài khoản mới</h3>
						<div style={{ marginBottom: 12 }}>
							<label>Tên người dùng:</label>
							<input name="username" value={createData.username} onChange={e => setCreateData({ ...createData, username: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} required />
						</div>
						<div style={{ marginBottom: 12 }}>
							<label>Email:</label>
							<input name="email" type="email" value={createData.email} onChange={e => setCreateData({ ...createData, email: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} required />
						</div>
						<div style={{ marginBottom: 12 }}>
							<label>Mật khẩu:</label>
							<input name="password" type="password" value={createData.password} onChange={e => setCreateData({ ...createData, password: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} required />
						</div>
						<div style={{ marginBottom: 20 }}>
							<label>Vai trò:</label>
							<select name="role" value={createData.role} onChange={e => setCreateData({ ...createData, role: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}>
								{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
							</select>
						</div>
						{createError && <div style={{ color: 'red', marginBottom: 8 }}>{createError}</div>}
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
							<button type="button" onClick={() => setShowCreate(false)} style={{ background: '#f3f4f6', color: '#111', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500 }} disabled={creating}>Hủy</button>
							<button type="submit" style={{ background: '#4ade80', color: '#065f46', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700 }} disabled={creating}>{creating ? 'Đang tạo...' : 'Tạo'}</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default AccountManagementPage;
