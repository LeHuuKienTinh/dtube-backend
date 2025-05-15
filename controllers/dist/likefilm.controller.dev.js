"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var db = require('../config/db'); // Assuming you have a database connection module
// Add a like


exports.addLike = function _callee(req, res) {
  var _req$body, id, user_id, movie_slug, liked_at, query;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, id = _req$body.id, user_id = _req$body.user_id, movie_slug = _req$body.movie_slug, liked_at = _req$body.liked_at;
          _context.prev = 1;
          query = "INSERT INTO likes(id, user_id, movie_slug, liked_at) VALUES (?, ?, ?, ?)";
          _context.next = 5;
          return regeneratorRuntime.awrap(db.execute(query, [id, user_id, movie_slug, liked_at]));

        case 5:
          res.status(201).json({
            message: 'Like added successfully'
          });
          _context.next = 11;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](1);
          res.status(500).json({
            error: _context.t0.message
          });

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 8]]);
}; // Get likes by user_id


exports.getLikesByUserId = function _callee2(req, res) {
  var user_id, query, _ref, _ref2, rows;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          user_id = req.params.user_id;
          _context2.prev = 1;
          query = "SELECT * FROM likes WHERE user_id = ?";
          _context2.next = 5;
          return regeneratorRuntime.awrap(db.execute(query, [user_id]));

        case 5:
          _ref = _context2.sent;
          _ref2 = _slicedToArray(_ref, 1);
          rows = _ref2[0];
          res.status(200).json(rows);
          _context2.next = 14;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](1);
          res.status(500).json({
            error: _context2.t0.message
          });

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 11]]);
}; // Get likes by movie_slug


exports.getLikesByMovieSlug = function _callee3(req, res) {
  var movie_slug, query, _ref3, _ref4, rows;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          movie_slug = req.params.movie_slug;
          _context3.prev = 1;
          query = "SELECT * FROM likes WHERE movie_slug = ?";
          _context3.next = 5;
          return regeneratorRuntime.awrap(db.execute(query, [movie_slug]));

        case 5:
          _ref3 = _context3.sent;
          _ref4 = _slicedToArray(_ref3, 1);
          rows = _ref4[0];
          res.status(200).json(rows);
          _context3.next = 14;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](1);
          res.status(500).json({
            error: _context3.t0.message
          });

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 11]]);
}; // Check if a user has liked a movie


exports.hasLikedMovie = function _callee4(req, res) {
  var _req$params, user_id, movie_slug, query, _ref5, _ref6, rows;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$params = req.params, user_id = _req$params.user_id, movie_slug = _req$params.movie_slug; // Lấy user_id và movie_slug từ params

          _context4.prev = 1;
          query = "SELECT * FROM likes WHERE user_id = ? AND movie_slug = ?";
          _context4.next = 5;
          return regeneratorRuntime.awrap(db.execute(query, [user_id, movie_slug]));

        case 5:
          _ref5 = _context4.sent;
          _ref6 = _slicedToArray(_ref5, 1);
          rows = _ref6[0];

          if (!(rows.length > 0)) {
            _context4.next = 12;
            break;
          }

          return _context4.abrupt("return", res.status(200).json({
            liked: true
          }));

        case 12:
          return _context4.abrupt("return", res.status(200).json({
            liked: false
          }));

        case 13:
          _context4.next = 18;
          break;

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](1);
          res.status(500).json({
            error: _context4.t0.message
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 15]]);
}; // Delete a like


exports.deleteLike = function _callee5(req, res) {
  var id, query;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          id = req.params.id;
          _context5.prev = 1;
          query = "DELETE FROM likes WHERE id = ?";
          _context5.next = 5;
          return regeneratorRuntime.awrap(db.execute(query, [id]));

        case 5:
          res.status(200).json({
            message: 'Like deleted successfully'
          });
          _context5.next = 11;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](1);
          res.status(500).json({
            error: _context5.t0.message
          });

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[1, 8]]);
};