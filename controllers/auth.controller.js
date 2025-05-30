/* controllers/auth.controller.js */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/auth.model');
const { sendLoginTokenMail } = require('../ultis/sendMail');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
let otpStore = {};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('Register body:', req.body);
    const { username, name, mail, password, type = '3' } = req.body;

    const existingUser = await User.findByUsername(username) || await User.findByMail(mail);
    if (existingUser) {
      return res.status(400).send({ message: 'Email hoặc username đã tồn tại' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const created = new Date();
    const expiry_time = new Date(created.getTime() - 24 * 60 * 60 * 1000); // 1 ngày trước

    const userId = await User.create({
      username,
      name,
      mail,
      password: hashedPassword,
      type,
      created,
      expiry_time,
      is_verified: false // đánh dấu chưa xác thực
    });

    // Tạo token xác thực email, hết hạn sau 10 phút
    const verifyToken = jwt.sign({ mail }, JWT_SECRET, { expiresIn: 600 });

    // Gửi mail xác thực
    const subject = 'Xác thực tài khoản DTube';
    const html = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #e50914;">Chào ${name || 'bạn'},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại DTube.</p>
        <p>Vui lòng bấm vào nút bên dưới để xác thực email:</p>
        <a href="${process.env.BACKEND_URL}/api/auth/verify-email?token=${verifyToken}" 
           style="display: inline-block; background-color: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Xác thực email
        </a>
        <p style="margin-top: 20px;">Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    `;

    await sendLoginTokenMail(mail, subject, html);

    res.status(201).send({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      userId
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!user || !passwordIsValid) return res.status(404).send({ message: 'User or pass incorrect' });
    if (!user.is_verified) {
      return res.status(403).send({ message: 'Tài khoản chưa được xác minh email. Vui lòng kiểm tra hộp thư.' });
    }
    const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({
      id: user.id,
      username: user.username,
      name: user.name,
      mail: user.mail,
      type: user.type,
      created: user.created,
      accountExpiryTime: user.expiry_time,
      accessToken: token,
      is_verified: user.is_verified
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Send login token via email
exports.sendTokenLogin = async (req, res) => {
  try {
    const { mail } = req.body;
    if (!mail) return res.status(400).send({ message: 'Email là bắt buộc' });

    const user = await User.findByMail(mail);
    if (!user) return res.status(404).send({ message: 'Email không tồn tại trong hệ thống' });

    const token = jwt.sign({ mail }, JWT_SECRET, { expiresIn: 300 });
    const subject = 'Token Đăng Nhập DTube';
    const html = `
      <div style="background-color: #fff; padding: 30px; color: #000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e50914; border-radius: 12px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); max-width: 600px; margin: auto; background: linear-gradient(45deg, #f5f5f5, #fff);">
        <h1 style="text-align: center; color: #e50914; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">DTube</h1>
        <p style="font-size: 18px; text-align: center;">Chào bạn!</p>
        <p style="font-size: 16px; text-align: center;">Bấm vào liên kết dưới đây để đăng nhập vào DTube:</p>
        <a href="${process.env.FRONTEND_URL}/token/${token}" style="display: block; width: fit-content; margin: 20px auto; text-align: center; font-size: 18px; font-weight: bold; background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2); transition: background-color 0.3s;">
          Đăng nhập ngay
        </a>
        <br><br>
        <p style="font-size: 16px; text-align: center;">Hoặc sao chép mã đăng nhập dưới đây:</p>
        <div style="font-size: 18px; font-weight: bold; background: #fff; color: #000; padding: 10px; text-align: center; border-radius: 6px; border: 1px solid #e50914; margin-bottom: 20px;">
          ${token}
        </div>
        <p style="font-size: 14px; color: #000; font-style: italic; text-align: center; margin-top: 30px;">
          ⚠️ Không chia sẻ mã này với bất kỳ ai để đảm bảo bảo mật tài khoản của bạn.
        </p>
        <p style="font-size: 14px; color: #000; text-align: center; margin-top: 20px;">
          <strong>Lưu ý:</strong> Để sao chép mã này, bạn có thể chọn và sao chép mã thủ công.
        </p>
      </div>
    `;

    await sendLoginTokenMail(mail, subject, html);
    res.status(200).send({ message: 'Đã gửi token đến email' });
  } catch (error) {
    console.error('Gửi mail thất bại:', error.message);
    res.status(500).send({ message: error.message });
  }
};

// Check login token
exports.checkToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).send({ message: 'Token là bắt buộc' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByMail(decoded.mail);
    if (!user) return res.status(404).send({ message: 'Không tìm thấy người dùng' });

    const accessToken = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({
      id: user.id,
      username: user.username,
      name: user.name,
      mail: user.mail,
      type: user.type,
      created: user.created,
      accountExpiryTime: user.expiry_time,
      accessToken
    });
  } catch (error) {
    res.status(401).send({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Get user type by id
exports.getUserTypeById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: 'Không tìm thấy người dùng' });
    res.status(200).send({ id: user.id, type: user.type });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Forgot password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { mail } = req.body;
    const user = await User.findByMail(mail);
    if (!user) return res.status(404).send({ message: 'Email không tồn tại' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore[mail] = { otp, expiresAt };

    const subject = 'Mã OTP đặt lại mật khẩu - DTube';
    const html = `<p>Chào ${user.name || 'bạn'},</p><h2>${otp}</h2>`;
    await sendLoginTokenMail(mail, subject, html);

    res.status(200).send({ message: 'Đã gửi mã OTP đến email của bạn' });
  } catch (error) {
    res.status(500).send({ message: 'Lỗi gửi OTP', error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { mail, otp } = req.body;
  const stored = otpStore[mail];
  if (!stored) return res.status(400).send({ message: 'Không có OTP cho email này' });
  if (Date.now() > stored.expiresAt) return res.status(400).send({ message: 'OTP đã hết hạn' });
  if (String(stored.otp) !== String(otp)) return res.status(400).send({ message: 'OTP không chính xác' });

  const resetToken = jwt.sign({ mail }, JWT_SECRET, { expiresIn: 300 });
  delete otpStore[mail];
  res.status(200).send({ message: 'OTP chính xác', resetToken });
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const { mail } = decoded;

    const user = await User.findByMail(mail);
    if (!user) return res.status(404).send({ message: 'Không tìm thấy người dùng' });

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    const updated = await User.updatePasswordByMail(mail, hashedPassword);
    if (!updated) return res.status(500).send({ message: 'Cập nhật mật khẩu thất bại' });

    res.status(200).send({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send({ message: 'Thiếu mã xác thực' });
    }

    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { mail } = decoded;

    // Tìm người dùng
    const user = await User.findByMail(mail);
    if (!user) {
      return res.status(404).send({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra đã xác thực chưa
    if (user.is_verified) {
      return res.status(200).send({ message: 'Tài khoản đã được xác thực trước đó' });
    }

    // Cập nhật trạng thái is_verified
    await User.verifyMail(mail);

    res.send(`
  <html>
    <head>
      <title>Xác thực Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f9f9f9;
        }
        .container {
          text-align: center;
        }
        .login-button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color:rgb(255, 0, 0);
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .login-button:hover {
          background-color:rgb(159, 0, 0);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Xác thực email thành công!</h2>
        <p>Bạn có thể đăng nhập để sử dụng hệ thống.</p>
        <button class="login-button" onclick="window.location.href='http://localhost:5173/login'">Đăng nhập</button>
      </div>
    </body>
  </html>
`);

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).send({ message: 'Mã xác thực đã hết hạn' });
    }
    return res.status(500).send({ message: 'Lỗi máy chủ: ' + error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { usermail, oldPassword, newPassword } = req.body;

    const user = await User.findByMail(usermail);
    if (!user) return res.status(404).send({ message: 'Không tìm thấy người dùng' });

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) return res.status(400).send({ message: 'Mật khẩu cũ không đúng' });

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    const updated = await User.updatePasswordByMail(usermail, hashedPassword);

    if (!updated) return res.status(500).send({ message: 'Cập nhật mật khẩu thất bại' });

    return res.status(200).send({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Lỗi server, vui lòng thử lại sau' });
  }
};
