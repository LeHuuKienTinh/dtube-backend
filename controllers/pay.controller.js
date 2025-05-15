const crypto = require('crypto');
const qs = require('querystring');
require('dotenv').config();

// Hàm định dạng ngày tháng và tạo ID đơn hàng
function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const orderId = `${year}${month}${day}${Math.floor(Math.random() * 1000)}`;
    return { createDate, orderId };
}

// Hàm sắp xếp object
function sortObject(obj) {
    const ordered = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            ordered[key] = obj[key];
        });
    return ordered;
}

exports.createPaymentUrl = (req, res) => {
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    const date = new Date();
    const { createDate, orderId } = formatDate(date);
    const amount = Number(req.body.amount);
    const bankCode = req.body.bankCode;
    const orderInfo = req.body.orderDescription || 'Thanh toán phim';
    const orderType = req.body.orderType || 'other';
    const locale = req.body.language || 'vn';

    // Kiểm tra số tiền hợp lệ
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
        vnp_Amount: amount * 100, // Chuyển đổi sang đồng (vì VNPAY yêu cầu đơn vị là đồng)
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
    };

    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp object theo key
    vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi query string từ object vnp_Params
    const signData = Object.entries(vnp_Params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`) // Dùng encodeURIComponent để tránh lỗi [object Object]
        .join('&');

    // Tạo chữ ký HMAC
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL thanh toán
    const queryString = qs.stringify(vnp_Params, { encode: false }); // Dùng encode: false để không encode lại giá trị của params
    const paymentUrl = `${vnpUrl}?${queryString}`;

    res.json({
        success: true,
        data: {
            payment_url: paymentUrl,
            transaction_id: orderId,
        },
    });

    // Log ra thông tin để kiểm tra
    console.log('Signed Data:', signData);
    console.log('Signed Hash:', signed);
    console.log('Payment URL:', paymentUrl);
};
