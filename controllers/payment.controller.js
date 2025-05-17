const Order = require('../models/order.model');
const Payment = require('../models/payment.model');

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
            content,
            transferAmount: amount,
            referenceCode: reference_code,
            transactionDate: transaction_date,
        } = req.body;

        // Tìm đơn hàng khớp với nội dung và số tiền, và đang chờ thanh toán
        const matchedOrder = await Order.findPendingByNoteAndAmount(content, amount);

        if (!matchedOrder) {
            return res.status(404).send('Order not found or already paid');
        }

        // Cập nhật trạng thái đơn hàng thành đã thanh toán
        const updated = await Order.updateStatus(matchedOrder.id, 'paid');

        if (!updated) {
            return res.status(500).send('Failed to update order status');
        }

        // Lưu bản ghi giao dịch thanh toán
        await Payment.create({
            sepay_id,
            bank,
            account_number,
            content,
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
