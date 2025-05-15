const db = require('../config/db');
const axios = require('axios');
require('dotenv').config();
// Lấy lịch sử theo user_id
const getHistoryByUserId = async (req, res) => {
  const userId = req.params.user_id;

  const sql = `
    SELECT 
      MAX(id) as id,
      user_id,
      movie_slug,
      episode_name,
      episode_slug,
      MAX(watched_at) as watched_at,
      MAX(created_at) as created_at
    FROM history_film 
    WHERE user_id = ?
    GROUP BY user_id, movie_slug, episode_slug
    ORDER BY watched_at DESC
  `;

  try {
    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Không có lịch sử nào' });
    }

    const fullHistory = await Promise.all(results.map(async (history) => {
      try {
        const apiRes = await axios.get(`${process.env.BACKEND_URL}/api/movies/${history.movie_slug}`);
        const episodes = apiRes.data.episodes || [];
        let link_embed = null;

        for (const server of episodes) {
          const foundEpisode = server.server_data.find(ep => ep.name === history.episode_name);
          if (foundEpisode) {
            link_embed = foundEpisode.link_embed;
            break;
          }
        }

        return {
          ...history,
          movie_name: apiRes.data.movie.name,
          thumb_url: apiRes.data.movie.thumb_url,
          poster_url: apiRes.data.movie.poster_url,
          link_embed: link_embed || null
        };
      } catch (err) {
        console.error(`Lỗi khi lấy dữ liệu phim ${history.movie_slug}:`, err.message);
        return { ...history, movie_name: null, thumb_url: null, link_embed: null };
      }
    }));

    return res.status(200).json(fullHistory);
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử:', err);
    return res.status(500).json({ error: 'Lỗi server khi lấy lịch sử' });
  }
};

// Cập nhật thời gian xem
const updateWatchedTime = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'Thiếu ID lịch sử' });
  }

  try {
    const now = new Date();
    const watched_at = now.toISOString().slice(0, 19).replace('T', ' ');

    const sql = `UPDATE history_film SET watched_at = ? WHERE id = ?`;
    const [result] = await db.query(sql, [watched_at, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bản ghi để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật thời gian xem thành công', watched_at });
  } catch (err) {
    console.error('Lỗi khi cập nhật thời gian xem:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Thêm hoặc cập nhật lịch sử
const addHistory = async (req, res) => {
  const { user_id, movie_slug, episode_name, episode_slug, watched_at } = req.body;

  // Validate required fields
  if (!user_id || !movie_slug || !episode_name || !watched_at) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      missing_fields: {
        user_id: !user_id,
        movie_slug: !movie_slug,
        episode_name: !episode_name,
        watched_at: !watched_at
      }
    });
  }

  try {
    // Check if history record already exists
    const checkSql = 'SELECT id FROM history_film WHERE user_id = ? AND movie_slug = ? AND episode_slug = ?';
    const [existing] = await db.query(checkSql, [user_id, movie_slug, episode_slug]);

    if (existing.length > 0) {
      // Update existing record
      const updateSql = 'UPDATE history_film SET watched_at = ? WHERE id = ?';
      await db.query(updateSql, [watched_at, existing[0].id]);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật lịch sử thành công',
        data: { id: existing[0].id, user_id, movie_slug, episode_name, episode_slug, watched_at }
      });
    } else {
      // Insert new record
      const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const insertSql = `
        INSERT INTO history_film 
        (user_id, movie_slug, episode_name, episode_slug, watched_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(insertSql, [
        user_id,
        movie_slug,
        episode_name,
        episode_slug,
        watched_at,
        created_at
      ]);

      return res.status(201).json({
        success: true,
        message: 'Thêm lịch sử thành công',
        data: {
          id: result.insertId,
          user_id,
          movie_slug,
          episode_name,
          episode_slug,
          watched_at,
          created_at
        }
      });
    }
  } catch (err) {
    console.error('Lỗi khi lưu lịch sử:', err);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi lưu lịch sử',
      details: err.message
    });
  }
};
// Lấy tập phim đã xem gần nhất
const getLastWatchedEpisode = async (req, res) => {
  const { user_id, movie_slug } = req.params;

  if (!user_id || !movie_slug) {
    return res.status(400).json({ error: 'Thiếu user_id hoặc movie_slug' });
  }

  try {
    const sql = `
      SELECT * FROM history_film 
      WHERE user_id = ? AND movie_slug = ? 
      ORDER BY watched_at DESC LIMIT 1
    `;
    const [result] = await db.query(sql, [user_id, movie_slug]);

    return res.status(200).json({ episode: result[0] || null });
  } catch (err) {
    console.error('Lỗi khi lấy tập đã xem gần nhất:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xóa lịch sử theo ID
const deleteHistory = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM history_film WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch sử để xóa' });
    }

    return res.status(200).json({ message: 'Xóa lịch sử thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy toàn bộ lịch sử (chỉ lấy bản gần nhất cho mỗi nội dung)
const getAllHistoryFilm = async (req, res) => {
  const sql = `
    SELECT 
      MAX(id) as id,
      user_id,
      movie_slug,
      episode_name,
      episode_slug,
      MAX(watched_at) as watched_at,
      MAX(created_at) as created_at
    FROM history_film 
    GROUP BY user_id, movie_slug, episode_slug
    ORDER BY watched_at DESC
  `;

  try {
    const [results] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử:', err);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi lấy lịch sử',
      message: err.message
    });
  }
};

module.exports = {
  getHistoryByUserId,
  updateWatchedTime,
  addHistory,
  getLastWatchedEpisode,
  deleteHistory,
  getAllHistoryFilm
};
