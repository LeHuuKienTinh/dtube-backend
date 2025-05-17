const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const db = require('../config/db');

exports.handleSePayWebhook = async (req, res) => {
    try {
        const apiKeyHeader = req.headers['authorization'];
        if (!apiKeyHeader || !apiKeyHeader.startsWith('Apikey ')) {
            return res.status(401).send('Unauthorized');
        }

        const apiKey = apiKeyHeader.split(' ')[1];
        if (apiKey !== process.env.SEPAY_API_KEY) {
            return res.status(401).send('Unauthorized');
        }

        const {
            id: sepay_id,
            gateway: bank,
            accountNumber: account_number,
            code: note,
            transferAmount: amount,
            referenceCode: reference_code,
            transactionDate: transaction_date,
        } = req.body;

        // Tìm đơn hàng khớp với code và số tiền
        const matchedOrder = await Order.findPendingByNoteAndAmount(note, amount);

        if (!matchedOrder) {
            return res.status(404).send('Order not found or already paid');
        }
        console.log(`[Webhook] Received payment for order ${matchedOrder.id} - user ${matchedOrder.user_id}`);

        // Cập nhật trạng thái đơn hàng thành đã thanh toán
        const updated = await Order.updateStatus(matchedOrder.id, 'paid');
        if (!updated) {
            return res.status(500).send('Failed to update order status');
        }

        // Cập nhật user.type từ 3 -> 2 nếu cần
        if (matchedOrder.user_id) {
            const [userRows] = await db.query('SELECT type FROM users WHERE id = ?', [matchedOrder.user_id]);
            if (userRows.length > 0 && userRows[0].type === 3) {
                await db.query('UPDATE users SET type = 2 WHERE id = ?', [matchedOrder.user_id]);
            }
        }

        // Ghi nhận giao dịch
        await Payment.create({
            sepay_id,
            bank,
            account_number,
            content: note,
            amount,
            reference_code,
            transaction_date,
            matched_order_id: matchedOrder.id,
        });

        return res.status(200).send('OK');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};
