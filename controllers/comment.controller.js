const db = require("../config/db");

// Controller for comments
const commentController = {
  // Create a new comment
  createComment: async (req, res) => {
    const { movie_slug, episode_slug, comment, time_film, user_id } = req.body;

    try {
      const query = `
                INSERT INTO comments (user_id, movie_slug, episode_slug, comment, time_film, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
      await db.execute(query, [
        user_id || null,
        movie_slug,
        episode_slug,
        comment,
        time_film,
      ]);
      res.status(201).json({ message: "Comment created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  },

  // Get all comments
  getComments: async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT * FROM comments");
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  },

  // Update a comment
  updateComment: async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.userId;
    const userType = req.userType;

    try {
      const [rows] = await db.execute("SELECT * FROM comments WHERE id = ?", [
        id,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const commentData = rows[0];
      if (commentData.user_id !== userId && userType !== "1") {
        return res.status(403).json({ error: "Permission denied" });
      }

      await db.execute("UPDATE comments SET comment = ? WHERE id = ?", [
        comment,
        id,
      ]);
      res.status(200).json({ message: "Comment updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  },

  // Delete a comment
  deleteComment: async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const userType = req.userType;

    try {
      const [rows] = await db.execute("SELECT * FROM comments WHERE    = ?", [
        id,
      ]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const commentData = rows[0];
      if (commentData.user_id !== userId && userType !== "1") {
        return res.status(403).json({ error: "Permission denied" });
      }

      await db.execute("DELETE FROM comments WHERE id = ?", [id]);
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  },
  // Get comments by movie_slug and episode_slug
  getCommentsByMovieAndEpisode: async (req, res) => {
    const { movie_slug, episode_slug } = req.params;
  
    if (!movie_slug || !episode_slug) {
      return res
        .status(400)
        .json({ error: "Movie slug and episode slug are required" });
    }
  
    try {
      const query = `
        SELECT 
          c.id,
          c.user_id,
          u.name,
          u.type,
          c.movie_slug,
          c.episode_slug,
          c.comment,
          c.time_film,
          c.created_at
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.movie_slug = ? AND c.episode_slug = ?
        ORDER BY c.created_at DESC
      `;
  
      const [rows] = await db.execute(query, [movie_slug, episode_slug]);
  
      if (rows.length === 0) {
        return res.status(404).json({
          message: "No comments found for the given movie and episode",
        });
      }
  
      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to fetch comments", details: error.message });
    }
  },
  
};

module.exports = commentController;
