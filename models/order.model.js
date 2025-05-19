const db = require('../config/db'); // đây là module connect db trả về connection/pool hỗ trợ promise

const Order = {
    create: async ({ user_id, package_id, amount, note }) => {
        const [result] = await db.execute(
            `INSERT INTO orders (user_id, package_id, amount, note) VALUES (?, ?, ?, ?)`,
            [user_id, package_id, amount, note || null]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute(`SELECT * FROM orders WHERE id = ?`, [id]);
        return rows[0];
    },

    findPendingByNoteAndAmount: async (note, amount) => {
        const [rows] = await db.execute(
            `SELECT * FROM orders WHERE note = ? AND amount = ? AND payment_status = 'pending'`,
            [note, amount]
        );
        return rows[0];
    },

    updateStatus: async (id, status) => {
        const [result] = await db.execute(
            `UPDATE orders SET payment_status = ? WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows > 0;
    },
    // Tìm đơn hàng trạng thái pending theo user_id
    findPendingByUserId: async (userId) => {
        const [rows] = await db.execute('SELECT * FROM orders WHERE user_id = ? AND payment_status = ?', [userId, 'pending']);
        return rows.length > 0 ? rows[0] : null;
    },

    deleteById: async (orderId) => {
        const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        return result.affectedRows > 0;
    },
    findAll: async () => {
        const [rows] = await db.execute(`
        SELECT 
            o.*, 
            u.username as username, u.name AS name, u.mail AS mail, u.type AS type,
            p.ten_pakage AS ten_package, p.gia_chinh AS gia_chinh
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN pakage p ON o.package_id = p.id
        ORDER BY o.created_at DESC
    `);
        return rows;
    },
};

module.exports = Order;
