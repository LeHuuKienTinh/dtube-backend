const Order = require('../models/order.model');
const db = require('../config/db');
console.log('DB connectedddd:', !!db.query); //
exports.createOrder = async (req, res) => {
    try {
        const { userId, packageId, amount, note } = req.body;

        if (!userId || !packageId || !amount) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        }
        const oldPendingOrder = await Order.findPendingByUserId(userId);

        if (oldPendingOrder) {
            // Xóa đơn hàng pending cũ
            await Order.deleteById(oldPendingOrder.id);
        }
        const orderId = await Order.create({
            user_id: userId,
            package_id: packageId,
            amount,
            note,
        });

        return res.status(201).json({ message: 'Tạo đơn hàng thành công', orderId });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.checkOrderStatus = async (req, res) => {
    try {
        const { note } = req.params;
        const [rows] = await db.query('SELECT payment_status FROM orders WHERE note = ?', [note]);
        console.log("NOTEEE", note)
        if (rows.length === 0) {
            console.log("k có đơn")
            return res.status(404).json({ message: 'KHONG TÌM THẤY ĐƠN HÀNG' });
        }
        return res.json({ status: rows[0].payment_status });
    } catch (error) {
        console.error('Error checking order status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};