require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// const router
const movieRoutes = require('./router/movie.routes');
const authRoutes = require('./router/auth.routes');
const chatRoutes = require("./router/chatbot.routes");
const userRoutes = require('./router/user.routes');
const historyRoutes = require('./router/historyfilm.routes');
const pakageRoutes = require('./router/pakage.routes');
const expiryRoutes = require('./router/expiry.routes');
const commentRoutes = require('./router/comment.routes');
const banflimRoutes = require('./router/bannedMovies.routes');
const viewRoutes = require('./router/view.routes');
const badwordsRoutes = require('./router/badword.routes');
const likeRoutes = require('./router/like.routes');
const deviceRoutes = require('./router/device.routes');
// const payRoutes = require('./router/pay.routes');
const reportRoutes = require('./router/report.routes');
// const paymentRoutes = require('./router/payment.routes');
const orderRoutes = require('./router/order.routes');
// MidleWare
app.use(cors(
    //     {
    //     origin: 'http://localhost:5173', // Hoặc '*', nhưng không an toàn khi deploy
    //     credentials: true, // nếu dùng cookie/jwt
    //   }
));
app.use(express.json());


// Sử dụng router 
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/historyfilm', historyRoutes);
app.use('/api/pakage', pakageRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/view', viewRoutes);
app.use('/api/device', deviceRoutes);
// app.use('/api/pay', payRoutes);
app.use('/api/reports', reportRoutes);
// app.use('/api/payment', paymentRoutes);
// Sử dụng router Admin 
app.use('/api/admin', userRoutes);
app.use('/api/admin/banmovie', banflimRoutes);
app.use('/api/admin/badwords', badwordsRoutes);
app.use('/api/order', orderRoutes);

// Run App
app.listen(PORT, '0.0.0.0', () => console.log(`Server chạy trên cổng 8h40 ${PORT}`));
