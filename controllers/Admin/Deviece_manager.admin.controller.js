const db = require("../../config/db"); // hoặc pool/query builder tùy bạn

// Lấy thiết bị theo ID
exports.getDeviceById = async (req, res) => {
    const { id } = req.params;
    try {
      const [devices] = await db.query("SELECT * FROM device WHERE user_id = ?", [id]);
  
      if (!devices.length) {
        return res.status(404).json({ message: "Không có thiết bị nào cho người dùng này" });
      }
  
      res.json({
        count: devices.length,
        devices
      });
    } catch (err) {
      console.error("❌ Lỗi getDevicesByUserId:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
};

// Thêm thiết bị mới (ID tự tăng, login_time từ máy chủ)
exports.createDevice = async (req, res) => {
    const { user_id, device_name } = req.body;
     console.log(req.body);
    if (!user_id || !device_name) {
      return res.status(400).json({ message: "Thiếu user_id hoặc device_name" });
    }
  
    try {
      await db.query(
        "INSERT INTO device (user_id, device_name) VALUES (?, ?)",
        [user_id, device_name]
      );
      res.status(201).json({ message: "✅ Thêm thiết bị thành công" });
    } catch (err) {
      console.error("❌ Lỗi createDevice:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
  

// Xóa thiết bị theo user_id và device_name
exports.deleteDevice = async (req, res) => {
    const { id } = req.params; // id ở đây là user_id
    const { device_name } = req.body;
  
    if (!device_name) {
      return res.status(400).json({ message: "Thiếu device_name" });
    }
  
    try {
      const [result] = await db.query(
        "DELETE FROM device WHERE user_id = ? AND device_name = ?",
        [id, device_name]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy thiết bị để xóa" });
      }
  
      res.json({ message: "✅ Xóa thiết bị thành công" });
    } catch (err) {
      console.error("❌ Lỗi deleteDevice:", err);
      res.status(500).json({ message: "Lỗi server" });
    }
  };
  