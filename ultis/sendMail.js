const nodemailer = require('nodemailer');
require('dotenv').config();

let otpStore = {}; // { mail: { otp, expiresAt } }
// Tạo transporter cho email gửi qua Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Hàm gửi email (có thể dùng chung cho nhiều mục đích như đăng nhập, quên mật khẩu...)
const sendLoginTokenMail = async (toEmail, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
};

module.exports = { sendLoginTokenMail };
