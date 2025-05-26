const db = require('../config/db'); // Kết nối mysql2/promise

exports.getCharts = async (req, res) => {
    try {
        const { filter, year, month, quarter } = req.query;

        let query = `
      SELECT 
        o.package_id,
        p.kieu_thoi_gian,
        COUNT(o.id) AS user_count,
        SUM(o.amount) AS total_amount
      FROM orders o
      JOIN pakage p ON o.package_id = p.id
      WHERE o.payment_status = 'paid'
    `;

        const params = [];

        if (filter === 'month') {
            query += ` AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?`;
            params.push(year, month);
        } else if (filter === 'quarter') {
            const quarters = {
                1: [1, 2, 3],
                2: [4, 5, 6],
                3: [7, 8, 9],
                4: [10, 11, 12]
            };
            query += ` AND YEAR(o.created_at) = ? AND MONTH(o.created_at) IN (${quarters[quarter].map(() => '?').join(',')})`;
            params.push(year, ...quarters[quarter]);
        } else if (filter === 'year') {
            query += ` AND YEAR(o.created_at) = ?`;
            params.push(year);
        }

        query += ` GROUP BY o.package_id, p.kieu_thoi_gian`;

        const [rows] = await db.execute(query, params);

        const result = rows.map(row => ({
            duration: `${row.kieu_thoi_gian} tháng`,
            user_count: row.user_count,
            total_amount: row.total_amount
        }));

        res.json(result);
    } catch (err) {
        console.error("Lỗi truy vấn thống kê:", err);
        res.status(500).json({ message: "Lỗi truy vấn thống kê" });
    }
};
