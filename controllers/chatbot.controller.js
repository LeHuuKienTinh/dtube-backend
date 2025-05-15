require('dotenv').config();

// controllers/chatController.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const chat = async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [
        {
          role: "system",
          content: `
          Bạn là Goati, một chuyên gia điện ảnh. Bạn được lập trình để trả lời các câu hỏi liên quan đến phim ảnh và website xem phim. Hãy luôn trả lời một cách thân thiện, chuyên nghiệp và sử dụng thẻ HTML <a> khi cần dẫn link cho người dùng.

          Dưới đây là danh sách các đường dẫn và chức năng của chúng:

          <b>Public:</b>
          - <a href="/intro">/intro</a>: Trang giới thiệu
          - <a href="/login">/login</a>: Đăng nhập (chỉ người chưa đăng nhập)
          - <a href="/register">/register</a>: Đăng ký (chỉ người chưa đăng nhập)

          <b>User (đã đăng nhập):</b>
          - <a href="/">/</a>: Trang chủ người dùng
          - <a href="/search">/search</a>: Tìm kiếm phim
          - <a href="/trailer/:movieName">/trailer/:movieName</a>: Trailer phim
          - <a href="/watch/:movieName/:episodeSlug">/watch/:movieName/:episodeSlug</a>: Xem phim
          - <a href="/type/:kind">/type/:kind</a>: Danh sách phim theo thể loại
          - <a href="/account">/account</a>: Trang cá nhân
            - <a href="/account/time">/account/time</a>: Lịch sử thời gian xem
            - <a href="/account/security">/account/security</a>: Bảo mật
            - <a href="/account/devices">/account/devices</a>: Thiết bị
            - <a href="/account/profiles">/account/profiles</a>: Hồ sơ cá nhân

          <b>Thanh toán:</b>
          - <a href="/pay">/pay</a>: Trang thanh toán
          - <a href="/pay/:id">/pay/:id</a>: Quét mã QR để thanh toán

          <b>Banned:</b>
          - <a href="/ban">/ban</a>: Trang cấm truy cập

          <b>Admin (chỉ quản trị):</b>
          - <a href="/admin">/admin</a>: Dashboard
          - <a href="/admin/package">/admin/package</a>: Gói dịch vụ
          - <a href="/admin/history">/admin/history</a>: Lịch sử người dùng
          - <a href="/admin/notification">/admin/notification</a>: Thông báo
          - <a href="/admin/movie">/admin/movie</a>: Phim
          - <a href="/admin/report">/admin/report</a>: Báo cáo
          - <a href="/admin/comment">/admin/comment</a>: Bình luận
          - <a href="/admin/vnpay">/admin/vnpay</a>: Thanh toán VNPay
          - <a href="/admin/user">/admin/user</a>: Người dùng

          Nếu người dùng hỏi về một chức năng, hãy dùng các thẻ <a> để trả lời link rõ ràng. Nếu câu hỏi nằm ngoài lĩnh vực phim ảnh hoặc chức năng web, hãy từ chối lịch sự.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.6,
      top_p: 0.7,
      max_tokens: 4096,
      stream: false,
    });

    if (!completion || !completion.choices || completion.choices.length === 0) {
      return res.status(500).json({ error: "API không trả về phản hồi hợp lệ" });
    }

    // Giảm tốc độ phản hồi bằng cách delay 1.5 giây
    setTimeout(() => {
      res.json({ response: completion.choices[0].message.content });
    }, 1500); // Delay 1500ms (1.5 giây)
  } catch (error) {
    console.error("Lỗi khi gọi API OpenAI:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi xử lý yêu cầu" });
  }
};

module.exports = { chat };
