const db = require('../config/db');

// Hàm kiểm tra và cập nhật người dùng hết hạn hoặc còn hạn
const checkExpiry = async () => {
    try {
        // Cập nhật người dùng đã hết hạn: type = 2 => type = 3
        const expiredQuery = `
            SELECT id FROM users WHERE expiry_time <= NOW() AND type = 2`;
        const [expiredUsers] = await db.execute(expiredQuery);

        const updateExpired = expiredUsers.map(async (user) => {
            const updateQuery = `UPDATE users SET type = 3 WHERE id = ?`;
            try {
                await db.execute(updateQuery, [user.id]);
            } catch (err) {
                console.error(`Error updating user ${user.id} to expired:`, err);
            }
        });

        // Cập nhật người dùng còn hạn lại: type = 3 => type = 2
        const validQuery = `
            SELECT id FROM users WHERE expiry_time > NOW() AND type = 3`;
        const [validUsers] = await db.execute(validQuery);

        const updateValid = validUsers.map(async (user) => {
            const updateQuery = `UPDATE users SET type = 2 WHERE id = ?`;
            try {
                await db.execute(updateQuery, [user.id]);
      
            } catch (err) {
                console.error(`Error updating user ${user.id} to valid:`, err);
            }
        });

        await Promise.all([...updateExpired, ...updateValid]);

    } catch (err) {
        console.error('Error checking user expiry:', err);
    }
};

// Gọi hàm kiểm tra mỗi giây
setInterval(checkExpiry, 1000);

module.exports = {
    checkExpiry,
};
