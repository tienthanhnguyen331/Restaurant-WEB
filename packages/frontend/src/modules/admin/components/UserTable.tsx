import React, { useState } from 'react';
import { updateAdminUser } from '../services/adminUserApi';
import { getAccessTokenByRole } from '../../../features/auth/hooks/useAuth';
import type { UserAdmin } from '../types/user.type';

interface UserTableProps {
	users: UserAdmin[];
	loading?: boolean;
	error?: string | null;
}

const actionBtnStyle = {
	margin: '0 4px',
	padding: '2px 8px',
	border: 'none',
	borderRadius: 6,
	cursor: 'pointer',
	fontWeight: 500,
	fontSize: 13,
};

const ROLES = ['WAITER', 'KITCHEN', 'USER', 'ADMIN'];

const UserTable: React.FC<UserTableProps> = ({ users, loading, error }) => {

	const [editUser, setEditUser] = useState<UserAdmin | null>(null);
	const [editData, setEditData] = useState<{ username: string; email: string; role: string }>({ username: '', email: '', role: 'USER' });

	const openEdit = (user: UserAdmin) => {
		setEditUser(user);
		setEditData({ username: user.username, email: user.email, role: user.role });
	};
	const closeEdit = () => {
		setEditUser(null);
	};
	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setEditData({ ...editData, [e.target.name]: e.target.value });
	};

	const [saving, setSaving] = useState(false);
	const [editError, setEditError] = useState<string | null>(null);

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editUser) return;
		setSaving(true);
		setEditError(null);
		const token = getAccessTokenByRole('ADMIN');
		if (!token) {
			setEditError('Vui lòng đăng nhập lại');
			setSaving(false);
			return;
		}
		try {
			const updated = await updateAdminUser(token, editUser.id, editData);
			// Cập nhật lại user trong danh sách
			if (updated) {
				// Nếu users là prop, cần callback lên cha để reload, ở đây tạm reload trang
				window.location.reload();
			}
			closeEdit();
		} catch (err: any) {
			setEditError(err?.response?.data?.message || 'Lỗi cập nhật');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div>Đang tải danh sách tài khoản...</div>;
	if (error) return <div style={{ color: 'red' }}>Lỗi: {error}</div>;
	if (!users.length) return <div>Không có tài khoản nào.</div>;

	return (
		<div style={{ overflowX: 'auto' }}>
			<table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001' }}>
				<thead style={{ background: '#f8fafc' }}>
					<tr>
						{/* <th style={{ padding: 10, textAlign: 'center' }}>ID</th> */}
						<th style={{ padding: 10, textAlign: 'center' }}>Username</th>
						<th style={{ padding: 10, textAlign: 'center' }}>Email</th>
						<th style={{ padding: 10, textAlign: 'center' }}>Role</th>
						{/* <th style={{ padding: 10, textAlign: 'center' }}>Trạng thái</th> */}
						<th style={{ padding: 10, textAlign: 'center' }}>Ngày tạo</th>
						<th style={{ padding: 10, textAlign: 'center' }}>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
							{/* <td style={{ textAlign: 'center', fontWeight: 600 }}>{user.id}</td> */}
							<td style={{ textAlign: 'center' }}>{user.username}</td>
							<td style={{ textAlign: 'center' }}>{user.email}</td>
							<td style={{ textAlign: 'center', fontWeight: 500 }}>{user.role}</td>
							{/* <td style={{ textAlign: 'center' }}>
								<span style={statusStyle(user.isActive)}>{user.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
							</td> */}
							<td style={{ textAlign: 'center' }}>{new Date(user.createdAt).toLocaleString('vi-VN')}</td>
							<td style={{ textAlign: 'center' }}>
								<button style={{ ...actionBtnStyle, background: '#fef3c7', color: '#b45309' }} onClick={() => openEdit(user)}>Sửa</button>

							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Modal chỉnh sửa */}
			{editUser && (
				<div style={{
					position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#0005', zIndex: 1000,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
				}}>
					<form onSubmit={handleEditSubmit} style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 16px #0002' }}>
						<h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Chỉnh sửa tài khoản</h3>
						<div style={{ marginBottom: 12 }}>
							<label>Tên người dùng:</label>
							<input name="username" value={editData.username} onChange={handleEditChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }} />
						</div>
						<div style={{ marginBottom: 12 }}>
							<label>Email:</label>
							<input name="email" value={editData.email} onChange={handleEditChange} disabled style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }} />
						</div>
						<div style={{ marginBottom: 20 }}>
							<label>Vai trò:</label>
							<select name="role" value={editData.role} onChange={handleEditChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}>
								{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
							</select>
						</div>
						{editError && <div style={{ color: 'red', marginBottom: 8 }}>{editError}</div>}
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
							<button type="button" onClick={closeEdit} style={{ ...actionBtnStyle, background: '#f3f4f6', color: '#111' }} disabled={saving}>Hủy</button>
							<button type="submit" style={{ ...actionBtnStyle, background: '#4ade80', color: '#065f46' }} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default UserTable;
