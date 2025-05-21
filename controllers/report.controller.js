// controllers/report.controller.js
const db = require('../config/db'); // mysql2 pool connection
const { createNotification } = require('./notifications.controller');
// Create a new report
exports.createReport = async (req, res) => {
    const {
        id_user,
        id_type_comment,
        movie_slug = null,
        movie_name = null,
        episode_name = null,
        id_comment = null,
        despcript,
        navigate,
        status = 0
    } = req.body;

    // Validate required fields
    if (!id_user || !id_type_comment || !despcript || !navigate) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (id_user, id_type_comment, despcript, navigate)' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO report (
         id_user, id_type_comment, movie_slug, movie_name,
         episode_name, id_comment, despcript,
         navigate, status, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                id_user,
                id_type_comment,
                movie_slug,
                movie_name,
                episode_name,
                id_comment,
                despcript,
                navigate,
                status
            ]
        );
        res.status(201).json({ message: 'Report created', report_id: result.insertId });
    } catch (err) {
        console.error('❌ Lỗi khi tạo báo cáo:', err);
        res.status(500).json({ error: 'Failed to create report' });
    }
};

// Delete a report by ID
exports.deleteReport = async (req, res) => {
    const { report_id } = req.params;
    try {
        const [result] = await db.execute(
            `DELETE FROM report WHERE id_report = ?`,
            [report_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error('❌ Lỗi khi xóa báo cáo:', err);
        res.status(500).json({ error: 'Failed to delete report' });
    }
};

// Update a report by ID
exports.updateReport = async (req, res) => {
    const { report_id } = req.params;
    const {
        despcript,
        navigate,
        status
    } = req.body;

    // At least one updatable field must be provided
    if (despcript == null && navigate == null && status == null) {
        return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE report
         SET despcript = COALESCE(?, despcript),
             navigate  = COALESCE(?, navigate),
             status    = COALESCE(?, status),
             updated_at = NOW()
       WHERE id_report = ?`,
            [despcript, navigate, status, report_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json({ message: 'Report updated successfully' });
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật báo cáo:', err);
        res.status(500).json({ error: 'Failed to update report' });
    }
};

// Get reports by type (1: movie, 2: episode, 3: comment)
exports.getReportsByType = async (req, res) => {
    const { type_comment } = req.params;
    const validTypes = [1, 2, 3];
    const type = parseInt(type_comment, 10);
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type_comment' });
    }

    try {
        const [reports] = await db.execute(
            `SELECT * FROM report WHERE id_type_comment = ? ORDER BY created_at DESC`,
            [type]
        );
        // Trả về 200 dù rỗng để frontend dễ xử lý
        res.status(200).json({ reports });
    } catch (err) {
        console.error('❌ Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
};

// Get all reports with JOIN to users and comments
exports.getAllReports = async (req, res) => {
    try {
        const [reports] = await db.execute(
            `SELECT 
         r.*, 
         u.username        AS reported_by, 
         c.comment        AS comment_content
       FROM report r
       LEFT JOIN users    u ON r.id_user    = u.id_user
       LEFT JOIN comments c ON r.id_comment = c.id`
        );
        // Trả về 200 dù không có dữ liệu
        res.status(200).json({ reports });
    } catch (err) {
        console.error('❌ Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve reports' });
    }
};

exports.updateReportStatus = async (req, res) => {
    const { report_id } = req.params;
    const { status } = req.body;

    if (status == null) {
        return res.status(400).json({ error: 'Thiếu status' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE report SET status = ?, updated_at = NOW() WHERE id_report = ?',
            [status, report_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo' });
        }

        // Nếu là status = 1 (đã xử lý), gửi thông báo
        if (status == 1) {
            const [reportRows] = await db.query(
                `SELECT * FROM report WHERE id_report = ?`,
                [report_id]
            );
            const report = reportRows[0];

            await createNotification(report.id_user, 'report_handled', `Báo cáo của bạn về phim "${report.movie_name}" đã được xử lý.`);
        }

        res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái' });
    }
};
