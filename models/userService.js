const db = require('../config/db');

async function updateExpiryTime(userId, monthsToAdd) {
    try {
        // Lấy expiry_time hiện tại của user
        const [rows] = await db.execute('SELECT expiry_time FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            throw new Error('User không tồn tại');
        }

        let currentExpiry = rows[0].expiry_time;
        const now = new Date();

        // Nếu expiry_time hiện tại < now thì tính từ now, ngược lại tính từ expiry_time cũ
        let baseDate = currentExpiry > now ? new Date(currentExpiry) : now;

        // Cộng thêm tháng
        baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

        // Cập nhật lại expiry_time
        await db.execute('UPDATE users SET expiry_time = ? WHERE id = ?', [baseDate, userId]);

        console.log(`Đã cập nhật expiry_time mới cho user ${userId}: ${baseDate}`);
    } catch (error) {
        console.error('Lỗi cập nhật expiry_time:', error.message);
        throw error;
    }
}

module.exports = { updateExpiryTime };
