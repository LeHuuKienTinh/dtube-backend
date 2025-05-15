"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var db = require("../../config/db"); // hoặc pool/query builder tùy bạn
// Lấy thiết bị theo ID


exports.getDeviceById = function _callee(req, res) {
  var id, _ref, _ref2, device;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = req.params.id;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(db.query("SELECT * FROM device WHERE id = ?", [id]));

        case 4:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          device = _ref2[0];

          if (device.length) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.status(404).json({
            message: "Thiết bị không tồn tại"
          }));

        case 9:
          res.json(device[0]);
          _context.next = 16;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](1);
          console.error("❌ Lỗi getDeviceById:", _context.t0);
          res.status(500).json({
            message: "Lỗi server"
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 12]]);
}; // Thêm thiết bị mới (ID tự tăng, login_time từ máy chủ)


exports.createDevice = function _callee2(req, res) {
  var _req$body, user_id, device_name;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, user_id = _req$body.user_id, device_name = _req$body.device_name;
          console.log(req.body);

          if (!(!user_id || !device_name)) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Thiếu user_id hoặc device_name"
          }));

        case 4:
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(db.query("INSERT INTO device (user_id, device_name) VALUES (?, ?)", [user_id, device_name]));

        case 7:
          res.status(201).json({
            message: "✅ Thêm thiết bị thành công"
          });
          _context2.next = 14;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](4);
          console.error("❌ Lỗi createDevice:", _context2.t0);
          res.status(500).json({
            message: "Lỗi server"
          });

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 10]]);
}; // Xóa thiết bị theo ID


exports.deleteDevice = function _callee3(req, res) {
  var id, result;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = req.params.id;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(db.query("DELETE FROM device WHERE id = ?", [id]));

        case 4:
          result = _context3.sent;

          if (!(result.affectedRows === 0)) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            message: "Không tìm thấy thiết bị để xóa"
          }));

        case 7:
          res.json({
            message: "✅ Xóa thiết bị thành công"
          });
          _context3.next = 14;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          console.error("❌ Lỗi deleteDevice:", _context3.t0);
          res.status(500).json({
            message: "Lỗi server"
          });

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
};