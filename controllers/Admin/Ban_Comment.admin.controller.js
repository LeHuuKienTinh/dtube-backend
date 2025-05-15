const db = require('../../config/db'); // Adjust the path to your database configuration

exports.addBadWord = async (req, res) => {
    const { word } = req.body;

    if (!word) {
        return res.status(400).json({ message: 'Word is required' });
    }

    const query = "INSERT INTO `bad_words`(`word`, `added_at`) VALUES (?, NOW())";

    try {
        await db.execute(query, [word]);
        res.status(201).json({ message: 'Bad word added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getBadWords = async (req, res) => {
    const query = "SELECT * FROM `bad_words`";

    try {
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateBadWord = async (req, res) => {
    const { id } = req.params;
    const { word } = req.body;

    if (!word) {
        return res.status(400).json({ message: 'Word is required' });
    }

    const query = "UPDATE `bad_words` SET `word` = ? WHERE `id` = ?";

    try {
        const [result] = await db.execute(query, [word, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bad word not found' });
        }

        res.status(200).json({ message: 'Bad word updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteBadWord = async (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM `bad_words` WHERE `id` = ?";

    try {
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bad word not found' });
        }

        res.status(200).json({ message: 'Bad word deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchBadWords = async (req, res) => {
    const { word } = req.query;

    if (!word) {
        return res.status(400).json({ message: 'Word query is required' });
    }

    const query = "SELECT * FROM `bad_words` WHERE `word` LIKE ?";

    try {
        const [rows] = await db.execute(query, [`%${word}%`]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
