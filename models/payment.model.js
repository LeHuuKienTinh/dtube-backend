const db = require('../config/db');

const Payment = {
    create: async ({ sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id }) => {
        const [result] = await db.execute(
            `INSERT INTO payments (sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id]
        );
        return result.insertId;
    },
    getByOrderId: async (orderId) => {
        const [rows] = await db.execute(
            `SELECT * FROM payments WHERE sepay_id = ? LIMIT 1`,
            [orderId]
        );
        return rows[0] || null;
    }
};

module.exports = Payment;
