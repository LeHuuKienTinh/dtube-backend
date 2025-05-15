"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var db = require('../config/db');

exports.increaseViewCount = function _callee(req, res) {
  var _req$body, movie_slug, episode_slug, viewed_at, _ref, _ref2, results;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, movie_slug = _req$body.movie_slug, episode_slug = _req$body.episode_slug;
          viewed_at = new Date(); // Input validation

          if (!(!movie_slug || !episode_slug || typeof movie_slug !== 'string' || typeof episode_slug !== 'string')) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            status: 'error',
            error: 'movie_slug and episode_slug are required and must be strings'
          }));

        case 4:
          _context.prev = 4;
          _context.next = 7;
          return regeneratorRuntime.awrap(db.query('SELECT * FROM view_count WHERE movie_slug = ? AND episode_slug = ?', [movie_slug, episode_slug]));

        case 7:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          results = _ref2[0];

          if (!(results.length > 0)) {
            _context.next = 16;
            break;
          }

          _context.next = 13;
          return regeneratorRuntime.awrap(db.query('UPDATE view_count SET count = count + 1, viewed_at = ? WHERE movie_slug = ? AND episode_slug = ?', [viewed_at, movie_slug, episode_slug]));

        case 13:
          return _context.abrupt("return", res.status(204).json());

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(db.query('INSERT INTO view_count (movie_slug, episode_slug, count, viewed_at) VALUES (?, ?, 1, ?)', [movie_slug, episode_slug, viewed_at]));

        case 18:
          return _context.abrupt("return", res.status(201).json({
            status: 'success',
            data: {
              message: 'View count created'
            }
          }));

        case 19:
          _context.next = 25;
          break;

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](4);
          console.error('Database error:', _context.t0);
          return _context.abrupt("return", res.status(500).json({
            status: 'error',
            error: 'Internal server error'
          }));

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 21]]);
}; // 2. Lấy lượt xem theo movie_slug và episode_slug


exports.getViewCountByMovieAndEpisode = function (req, res) {
  var _req$params = req.params,
      movie_slug = _req$params.movie_slug,
      episode_slug = _req$params.episode_slug;
  var query = "\n    SELECT count FROM view_count \n    WHERE movie_slug = ? AND episode_slug = ?\n  ";
  db.query(query, [movie_slug, episode_slug], function (err, result) {
    if (err) return res.status(500).json({
      error: err
    });

    if (result.length > 0) {
      res.status(200).json({
        count: result[0].count
      });
    } else {
      res.status(404).json({
        message: 'Not found',
        count: 0
      });
    }
  });
}; // 3. Lấy tổng lượt xem theo movie_slug


exports.getTotalViewCountByMovie = function (req, res) {
  var movie_slug = req.params.movie_slug;
  var query = "\n    SELECT SUM(count) AS total_views \n    FROM view_count \n    WHERE movie_slug = ?\n  ";
  db.query(query, [movie_slug], function (err, result) {
    if (err) return res.status(500).json({
      error: err
    });
    res.status(200).json({
      total_views: result[0].total_views || 0
    });
  });
}; // 4. Lấy toàn bộ lượt xem phim


exports.getAllViewFilms = function (req, res) {
  var query = "SELECT * FROM view_count ORDER BY viewed_at DESC";
  db.query(query, function (err, results) {
    if (err) return res.status(500).json({
      error: err
    });
    res.status(200).json(results);
  });
};