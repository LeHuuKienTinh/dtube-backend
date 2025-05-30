const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const db = require('../config/db');
const { updateExpiryTime } = require('../models/userService');


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

        ///TĂNG THỜI GIANN EXPERIII
        if (matchedOrder.package_id) {
            const [packageRows] = await db.query(
                'SELECT kieu_thoi_gian FROM pakage WHERE id = ?',
                [matchedOrder.package_id]
            );

            if (packageRows.length > 0) {
                const duration = parseInt(packageRows[0].kieu_thoi_gian, 10);
                await updateExpiryTime(matchedOrder.user_id, duration);
            }
        }

        if (matchedOrder.user_id) {
            const [userRows] = await db.query('SELECT type FROM users WHERE id = ?', [matchedOrder.user_id]);
            console.log('Current user type:', userRows[0].type);
            if (userRows.length > 0 && String(userRows[0].type) === '3') {
                const [result] = await db.query('UPDATE users SET type = ? WHERE id = ?', ['2', matchedOrder.user_id]);
                console.log('affectedRows:', result.affectedRows);
            }
            const [check] = await db.query('SELECT type FROM users WHERE id = ?', [matchedOrder.user_id]);
            console.log('User type after update:', check[0].type);
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
exports.buyPackage = async (req, res) => {
    try {
        const userId = req.user.id;  // hoặc từ req.body
        const months = req.body.months; // số tháng gói mua

        await updateExpiryTime(userId, months);

        res.status(200).send({ message: 'Đã gia hạn tài khoản thành công' });
        console.log("MUA GÓI THÀNH CONGGG")
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getPaymentByOrderId = async (req, res) => {
    const { id } = req.params; // đây là order.id

    try {
        const payment = await Payment.getByOrderId(id);
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán nào cho đơn hàng này.' });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin thanh toán.' });
    }
};