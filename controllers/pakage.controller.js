const db = require('../config/db'); // db là mysql2/promise

// Tạo package
exports.createPakage = async (req, res) => {
    try {
        const { ten_pakage, gia_truoc_khi_giam, gia_chinh, kieu_thoi_gian } = req.body;
        const query = `
            INSERT INTO pakage ( ten_pakage, gia_truoc_khi_giam, gia_chinh, kieu_thoi_gian)
            VALUES ( ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [ten_pakage, gia_truoc_khi_giam, gia_chinh, kieu_thoi_gian]);
        res.status(201).json({ message: "Package created successfully", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy tất cả packages
exports.getAllPakages = async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM pakage");
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy package theo ID
exports.getPakageById = async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.query("SELECT * FROM pakage WHERE id = ?", [id]);
        if (results.length === 0) return res.status(404).json({ message: "Package not found" });
        res.status(200).json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật package theo ID
exports.updatePakage = async (req, res) => {
    try {
        const { id } = req.params;
        const { ten_pakage, gia_truoc_khi_giam, gia_chinh, kieu_thoi_gian } = req.body;
        const query = `
            UPDATE pakage
            SET ten_pakage = ?, gia_truoc_khi_giam = ?, gia_chinh = ?, kieu_thoi_gian = ?
            WHERE id = ?
        `;
        const [result] = await db.query(query, [ten_pakage, gia_truoc_khi_giam, gia_chinh, kieu_thoi_gian, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
        res.status(200).json({ message: "Package updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa package theo ID
exports.deletePakage = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM pakage WHERE id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
        res.status(200).json({ message: "Package deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
