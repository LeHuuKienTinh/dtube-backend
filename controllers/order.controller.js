const Order = require('../models/order.model');

exports.createOrder = async (req, res) => {
    try {
        const { userId, packageId, amount, note } = req.body;

        if (!userId || !packageId || !amount) {
            return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
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
