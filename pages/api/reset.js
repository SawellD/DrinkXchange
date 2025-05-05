import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { pin } = req.body;

    if (pin !== '2233') {
      return res.status(403).json({ success: false, message: "Falscher PIN" });
    }

    try {
      const db = new Database(dbPath);

      db.prepare('DELETE FROM sales_temp').run();
      db.prepare('DELETE FROM sales_total').run();

      db.close();

      return res.status(200).json({ success: true, message: "Datenbank erfolgreich zurückgesetzt!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Fehler beim Zurücksetzen" });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
