const db = require('../config/db');

// 1. Tăng lượt xem
exports.increaseViewCount = async (req, res) => {
  const { movie_slug, episode_slug, movie_name, episode_number } = req.body;
  const viewed_at = new Date();

  if (!movie_slug?.trim() || !episode_slug?.trim()) {
    return res.status(400).json({
      status: 'error',
      error: 'movie_slug and episode_slug are required',
    });
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM view_count WHERE movie_slug = ? AND episode_slug = ?',
      [movie_slug, episode_slug]
    );

    if (results.length > 0) {
      await db.query(
        `UPDATE view_count 
         SET count = count + 1, viewed_at = ?, movie_name = ?, episode_number = ? 
         WHERE movie_slug = ? AND episode_slug = ?`,
        [viewed_at, movie_name, episode_number, movie_slug, episode_slug]
      );
    } else {
      await db.query(
        `INSERT INTO view_count 
         (movie_slug, episode_slug, movie_name, episode_number, count, viewed_at) 
         VALUES (?, ?, ?, ?, 1, ?)`,
        [movie_slug, episode_slug, movie_name, episode_number, viewed_at]
      );
    }

    const [[{ count }]] = await db.query(
      'SELECT count FROM view_count WHERE movie_slug = ? AND episode_slug = ?',
      [movie_slug, episode_slug]
    );

    return res.status(200).json({
      status: 'success',
      message: 'View count updated',
      count,
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  }
};

// 2. Lấy lượt xem theo movie_slug và episode_slug
exports.getViewCountByMovieAndEpisode = async (req, res) => {
  const { movie_slug, episode_slug } = req.params;

  try {
    const [result] = await db.query(
      `SELECT count FROM view_count WHERE movie_slug = ? AND episode_slug = ?`,
      [movie_slug, episode_slug]
    );

    if (result.length > 0) {
      res.status(200).json({ count: result[0].count });
    } else {
      res.status(404).json({ message: 'Not found', count: 0 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Lấy tổng lượt xem theo movie_slug
exports.getTotalViewCountByMovie = async (req, res) => {
  const { movie_slug } = req.params;

  try {
    const [result] = await db.query(
      `SELECT SUM(count) AS total_views FROM view_count WHERE movie_slug = ?`,
      [movie_slug]
    );

    res.status(200).json({ total_views: result[0].total_views || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. Lấy toàn bộ lượt xem phim
exports.getAllViewFilms = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT * FROM view_count ORDER BY viewed_at DESC`);
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
