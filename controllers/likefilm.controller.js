const db = require('../config/db');

// Hàm xử lý lỗi tập trung
const handleError = (res, error, status = 500) => {
  console.error('Error:', error);
  res.status(status).json({
    success: false,
    message: error.message || 'Lỗi server',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Thêm like mới
exports.addLike = async (req, res) => {
  const { user_id, movie_slug, movie_name } = req.body;

  // Validate input
  if (!user_id || !movie_slug || !movie_name) {
    return handleError(res, new Error('Thiếu user_id, movie_slug hoặc movie_name'), 400);
  }

  try {
    // Kiểm tra trùng lặp
    const [existing] = await db.execute(
      'SELECT id FROM likes WHERE user_id = ? AND movie_slug = ?',
      [user_id, movie_slug]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Bạn đã like phim này rồi',
        data: { liked: true }
      });
    }

    // Thêm like mới
    const [result] = await db.execute(
      'INSERT INTO likes (user_id, movie_slug, movie_name) VALUES (?, ?, ?)',
      [user_id, movie_slug, movie_name]
    );

    res.status(201).json({
      success: true,
      message: 'Like thành công',
      data: {
        likeId: result.insertId,
        user_id,
        movie_slug,
        movie_name
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Lấy danh sách like theo user_id
exports.getLikesByUserId = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return handleError(res, new Error('Thiếu user_id'), 400);
  }

  try {
    const [rows] = await db.execute(
      'SELECT movie_slug, movie_name, liked_at FROM likes WHERE user_id = ?',
      [user_id]
    );

    res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Lấy danh sách like theo movie_slug
exports.getLikesByMovieSlug = async (req, res) => {
  const { movie_slug } = req.params;

  if (!movie_slug) {
    return handleError(res, new Error('Thiếu movie_slug'), 400);
  }

  try {
    const [rows] = await db.execute(
      'SELECT user_id, movie_name, liked_at FROM likes WHERE movie_slug = ?',
      [movie_slug]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Kiểm tra like status
exports.hasLikedMovie = async (req, res) => {
  const { user_id, movie_slug } = req.params;

  if (!user_id || !movie_slug) {
    return handleError(res, new Error('Thiếu user_id hoặc movie_slug'), 400);
  }

  try {
    const [rows] = await db.execute(
      'SELECT id FROM likes WHERE user_id = ? AND movie_slug = ? LIMIT 1',
      [user_id, movie_slug]
    );

    res.status(200).json({
      success: true,
      liked: rows.length > 0 ? 1 : 0,  // 👈 Trả về 1 hoặc 0
      likeId: rows[0]?.id || null
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Xóa like
exports.deleteLike = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return handleError(res, new Error('Thiếu id like'), 400);
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM likes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(200).json({
        success: true,
        message: 'Like không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa like thành công'
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Lấy tất cả likes (không phân quyền)
exports.getAllLikes = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM likes');
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getMostLikedMovies = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT movie_slug, movie_name, COUNT(*) AS like_count
      FROM likes
      GROUP BY movie_slug
      ORDER BY like_count DESC
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    handleError(res, error);
  }
};
