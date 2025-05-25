const db = require('../config/db');

exports.createNotification = async function (userId, type, content) {
    await db.query(
        `INSERT INTO notifications (user_id, type, content) VALUES (?, ?, ?)`,
        [userId, type, content]
    );
};

exports.getNotificationsByUser = async function (req, res) {
    try {
        const userId = req.params.userId;

        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông báo" });
    }
};
exports.sendSystemNotification = async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: "Nội dung thông báo không được để trống." });
    }

    try {
        // Lấy tất cả user có type = 2
        const [users] = await db.query(`SELECT id FROM users WHERE type = 2`);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
        }

        // Gửi thông báo cho từng user
        const insertPromises = users.map(user => {
            return db.query(
                `INSERT INTO notifications (user_id, type, content) VALUES (?, ?, ?)`,
                [user.id, 'system_noti', content]
            );
        });

        await Promise.all(insertPromises);

        res.status(200).json({ message: `Đã gửi thông báo tới ${users.length} người dùng.` });
    } catch (err) {
        console.error('Lỗi khi gửi thông báo:', err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
exports.getAllNotifications = async (req, res) => {
    try {
        // Lấy toàn bộ notifications cùng user name
        const [rows] = await db.query(`
      SELECT 
        n.id,
        n.user_id,
        u.name AS username,
        n.type,
        n.content,
        n.created_at
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
    `);

        // Lọc loại bỏ trùng lặp tương tự logic ROW_NUMBER() theo kiểu system_noti
        const unique = [];
        const seen = new Set();

        for (const row of rows) {
            let key;

            if (row.type === 'system_noti') {
                key = `${row.content}_${row.created_at.toISOString()}`; // nối content + created_at
            } else {
                key = `${row.id}`; // duy nhất theo id
            }

            if (!seen.has(key)) {
                seen.add(key);
                unique.push(row);
            }
        }

        res.json(unique);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách thông báo:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
