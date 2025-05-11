import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { oldPin, newPin } = req.body;
    const db = new Database(dbPath);

    const row = db.prepare('SELECT hashed_pin FROM pin_storage WHERE id = 1').get();

    if (!row || !bcrypt.compareSync(oldPin, row.hashed_pin)) {
        db.close();
        return res.status(403).json({ error: "Falscher PIN!" });
    }

    const newHashedPin = bcrypt.hashSync(newPin, 10);
    db.prepare('UPDATE pin_storage SET hashed_pin = ? WHERE id = 1').run(newHashedPin);

    db.close();
    res.status(200).json({ success: true, message: "PIN erfolgreich geändert!" });
}
