const db = require('../config/db');

const Payment = {
    create: async ({ sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id }) => {
        const [result] = await db.execute(
            `INSERT INTO payments (sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sepay_id, bank, account_number, content, amount, reference_code, transaction_date, matched_order_id]
        );
        return result.insertId;
    }
};

module.exports = Payment;
