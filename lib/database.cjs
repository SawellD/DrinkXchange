const path = require("path");
const Database = require("better-sqlite3");

const databasePath = path.join(process.cwd(), "database", "bierboerse.db");

function openDatabase() {
  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  return db;
}

module.exports = { databasePath, openDatabase };