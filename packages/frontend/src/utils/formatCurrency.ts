export const formatCurrency = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '0 VNĐ';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '0 VNĐ';
    return `${value.toLocaleString('vi-VN')} VNĐ`;
};
