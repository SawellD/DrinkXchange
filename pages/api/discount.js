import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
  const db = new Database(dbPath);

  try {
    const row = db.prepare('SELECT drink_id, end_time FROM discount WHERE id = 1').get();

    if (!row) {
      return res.status(200).json({ success: true, drink_id: null });
    }

    const now = new Date();
    const endTime = new Date(row.end_time);

    if (endTime <= now) {
      // Rabatt ist abgelaufen → Eintrag löschen
      db.prepare('DELETE FROM discount WHERE id = 1').run();
      return res.status(200).json({ success: true, drink_id: null });
    }

    const remaining = Math.max(0, Math.floor((endTime - now) / 1000)); // Sekunden

    return res.status(200).json({
      success: true,
      drink_id: row.drink_id,
      remaining,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Rabatts:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  } finally {
    db.close(); // ✅ wird immer aufgerufen
  }
}
