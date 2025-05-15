const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config();

function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const orderId = `${year}${month}${day}${Math.floor(Math.random() * 100000)}`;
    return { createDate, orderId };
}

function sortObject(obj) {
    const ordered = {};
    Object.keys(obj).sort().forEach(key => {
        ordered[key] = obj[key];
    });
    return ordered;
}

exports.createPaymentUrl = (req, res) => {
    try {
        // Mã gốc của bạn ở đây...

        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            return res.status(500).json({ success: false, message: 'Thiếu biến môi trường cấu hình VNPAY' });
        }

        const { createDate, orderId } = formatDate(new Date());
        const amount = Number(req.body.amount);
        const bankCode = req.body.bankCode;
        const orderInfo = req.body.orderDescription || 'Thanh toán đơn hàng';
        const orderType = req.body.orderType || 'other';
        const locale = req.body.language || 'vn';

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, message: "Số tiền không hợp lệ" });
        }

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: orderType,
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate
        };

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const signData = Object.entries(vnp_Params)
            .map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');

        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const queryString = require('qs').stringify(vnp_Params, { encode: false });
        const paymentUrl = `${vnpUrl}?${queryString}`;

        return res.json({
            success: true,
            data: {
                payment_url: paymentUrl,
                transaction_id: orderId
            }
        });

    } catch (error) {
        console.error('Lỗi tạo URL thanh toán:', error);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo URL thanh toán' });
    }
};



exports.vnpayReturn = (req, res) => {
    const secretKey = process.env.VNP_HASH_SECRET;
    let vnp_Params = req.query;

    // Lấy chữ ký gửi về từ VNPAY
    const secureHash = vnp_Params.vnp_SecureHash;
    // Loại bỏ trường chữ ký ra khỏi params trước khi tạo lại chữ ký
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // Sắp xếp params theo key
    const sortedParams = {};
    Object.keys(vnp_Params).sort().forEach(key => {
        sortedParams[key] = vnp_Params[key];
    });

    // Tạo chuỗi ký với encodeURIComponent cho từng giá trị
    const signData = Object.entries(sortedParams)
        .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        .join('&');

    // Tạo chữ ký từ server
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (signed === secureHash) {
        // Chữ ký đúng, có thể cập nhật trạng thái đơn hàng
        res.json({ success: true, message: 'Thanh toán thành công' });
    } else {
        // Chữ ký sai
        res.json({ success: false, message: 'Sai chữ ký' });
    }
};
