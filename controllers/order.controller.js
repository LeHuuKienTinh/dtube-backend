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

        const [rows] = await db.query(`
      SELECT o.payment_status, o.user_id, u.name, u.mail, u.type, u.username
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.note = ?
    `, [note]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'KHÔNG TÌM THẤY ĐƠN HÀNG' });
        }

        const order = rows[0];

        const response = {
            status: order.payment_status
        };

        if (order.payment_status === 'paid') {
            response.user = {
                id: order.user_id,
                name: order.name,
                mail: order.mail,
                type: order.type,
                username: order.username
            };
        }

        return res.json(response);

    } catch (error) {
        console.error('Error checking order status:', error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
