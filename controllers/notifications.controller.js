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
        const [rows] = await db.query(`
            SELECT *
                FROM (
                    SELECT 
                        n.id,
                        CASE 
                            WHEN n.type = 'system_noti' THEN NULL 
                            ELSE n.user_id 
                        END AS user_id,
                        CASE 
                            WHEN n.type = 'system_noti' THEN 'Tất cả' 
                            ELSE u.name 
                        END AS username,
                        n.type,
                        n.content,
                        n.created_at,
                        ROW_NUMBER() OVER (
                            PARTITION BY 
                                CASE WHEN n.type = 'system_noti' THEN n.content ELSE n.id END,
                                CASE WHEN n.type = 'system_noti' THEN n.created_at ELSE n.id END
                            ORDER BY n.id
                        ) as rn
                    FROM notifications n
                    JOIN users u ON n.user_id = u.id
                ) as temp
                WHERE rn = 1
                ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách thông báo:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
