const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

db.run('CREATE TABLE IF NOT EXISTS inventory (id NUMBER, title TEXT, resp_person TEXT)');

db.run('CREATE TABLE IF NOT EXISTS user (id NUMBER, username TEXT, password TEXT)');

module.exports = db;