/* models/auth.model.js */
const db = require('../config/db');

class User {
  static async create({ username, name, mail, password, type = '3', created, expiry_time }) {
    const [result] = await db.execute(
      'INSERT INTO users (username, name, mail, password, type, created, expiry_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, name, mail, password, type, created, expiry_time]
    );
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByMail(mail) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE mail = ?',
      [mail]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, name, mail, type, created, expiry_time FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updatePasswordByMail(mail, hashedPassword) {
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE mail = ?',
      [hashedPassword, mail]
    );
    return result.affectedRows > 0;
  }

  static async verifyMail(mail) {
    const sql = 'UPDATE users SET is_verified = 1 WHERE mail = ?';
    const [result] = await db.execute(sql, [mail]);
    return result;
  }
}

module.exports = User;

