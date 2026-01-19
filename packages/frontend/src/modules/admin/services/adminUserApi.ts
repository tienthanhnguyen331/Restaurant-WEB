import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const updateAdminUser = async (token: string, userId: string, data: { username: string; email: string; role: string }) => {
    const response = await axios.put(`${API_URL}/api/users/${userIdAsStr(userId)}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Helper since userId might be number or string
function userIdAsStr(id: string | number) {
    return String(id);
}
