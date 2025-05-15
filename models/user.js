const db = require("../config/db");

const User = {
    create: async (user) => {
        const query = 'INSERT INTO `users`(`id`, `username`, `name`, `mail`, `password`, `type`, `created`, `expiry_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        try {
            const [result] = await db.query(query, [
                user.id, 
                user.username, 
                user.name, 
                user.mail, 
                user.password, 
                user.type, 
                user.created, 
                user.expiry_time
            ]);
            return result;
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        const query = 'SELECT * FROM `users`';
        try {
            const [rows] = await db.query(query);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    getById: async (id) => {
        const query = 'SELECT * FROM `users` WHERE `id` = ?';
        try {
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (err) {
            throw err;
        }
    },

    update: async (id, user) => {
        const query = 'UPDATE `users` SET `username` = ?, `name` = ?, `mail` = ?, `password` = ?, `type` = ?, `created` = ?, `expiry_time` = ? WHERE `id` = ?';
        try {
            const [result] = await db.query(query, [
                user.username, 
                user.name, 
                user.mail, 
                user.password, 
                user.type, 
                user.created, 
                user.expiry_time, 
                id
            ]);
            return result;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        const query = 'DELETE FROM `users` WHERE `id` = ?';
        try {
            const [result] = await db.query(query, [id]);
            return result;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = User;