const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'database', 'zabandaan.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sql');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Run schema to ensure tables exist
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

const hasAnyContent = () => {
  const tables = [
    'idioms_content',
    'wordsearch_wordlists',
    'poetry_content',
  ];

  return tables.every((table) => {
    const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
    return Number(row.count) > 0;
  });
};

module.exports = db;

if (!hasAnyContent()) {
  try {
    require('./seed.js');
  } catch (error) {
    console.error('Failed to seed database with starter content:', error);
  }
}
