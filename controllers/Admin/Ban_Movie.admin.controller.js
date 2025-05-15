const db = require('../../config/db');

// Create a new banned movie
exports.createBannedMovie = async (req, res) => {
    const { slug, title, description } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();

    try {
        const [result] = await db.execute(
            'INSERT INTO `banned_movies`(`slug`, `title`, `description`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?)',
            [slug, title, description, createdAt, updatedAt]
        );
        res.status(201).json({ id: result.insertId, slug, title, description, createdAt, updatedAt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all banned movies
exports.getAllBannedMovies = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM `banned_movies`');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete a banned movie by ID
exports.deleteBannedMovie = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute('DELETE FROM `banned_movies` WHERE `id` = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Banned movie not found' });
        }
        res.status(200).json({ message: 'Banned movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};