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
    }
};

module.exports = Order;
