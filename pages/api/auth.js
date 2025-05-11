import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { pin } = req.body;
    const db = new Database(dbPath);

    const row = db.prepare('SELECT hashed_pin FROM pin_storage WHERE id = 1').get();
    db.close();

    if (!row || !bcrypt.compareSync(pin, row.hashed_pin)) {
        return res.status(403).json({ error: "Falscher PIN!" });
    }

    res.status(200).json({ success: true });
}
