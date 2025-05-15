"use strict";

exports.validateLike = function (req, res, next) {
  var _req$body = req.body,
      user_id = _req$body.user_id,
      movie_slug = _req$body.movie_slug;

  if (!user_id || !movie_slug) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin user_id hoặc movie_slug'
    });
  } // Kiểm tra định dạng movie_slug


  if (!/^[a-z0-9-]+$/.test(movie_slug)) {
    return res.status(400).json({
      success: false,
      message: 'Movie_slug không hợp lệ'
    });
  }

  next();
};