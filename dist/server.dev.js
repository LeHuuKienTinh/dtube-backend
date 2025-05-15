"use strict";

require('dotenv').config();

var express = require('express');

var cors = require('cors');

var app = express();
var PORT = process.env.PORT || 5000; // const router

var movieRoutes = require('./router/movie.routes');

var authRoutes = require('./router/auth.routes');

var chatRoutes = require("./router/chatbot.routes");

var userRoutes = require('./router/user.routes');

var historyRoutes = require('./router/historyfilm.routes');

var pakageRoutes = require('./router/pakage.routes');

var expiryRoutes = require('./router/expiry.routes');

var commentRoutes = require('./router/comment.routes');

var banflimRoutes = require('./router/bannedMovies.routes');

var viewRoutes = require('./router/view.routes');

var badwordsRoutes = require('./router/badword.routes');

var likeRoutes = require('./router/like.routes');

var deviceRoutes = require('./router/device.routes');

var payRoutes = require('./router/pay.routes'); // MidleWare


app.use(cors());
app.use(express.json()); // Sử dụng router 

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/historyfilm', historyRoutes);
app.use('/api/pakage', pakageRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/view', viewRoutes);
app.use('/api/pay', payRoutes); // Sử dụng router Admin 

app.use('/api/admin', userRoutes);
app.use('/api/admin/banmovie', banflimRoutes);
app.use('/api/admin/badwords', badwordsRoutes); // Run App

app.listen(PORT, '0.0.0.0', function () {
  return console.log("Server ch\u1EA1y tr\xEAn c\u1ED5ng ".concat(PORT));
});