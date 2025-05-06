// pages/api/manual-discount.js
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');
const CORRECT_PIN = '2233'; // Use the same PIN as debug page

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { pin, drink_id, clear } = req.body;

    if (pin !== CORRECT_PIN) {
      return res.status(403).json({ success: false, message: "Falscher PIN" });
    }

    const db = new Database(dbPath);

    try {
      // Always delete existing discount before setting a new one or clearing
      db.prepare('DELETE FROM discount').run();

      if (clear) {
        // If clear flag is set, we're done after deleting
        db.close();
        return res.status(200).json({ success: true, message: "Manueller Rabatt gelöscht." });
      }

      if (drink_id !== undefined && drink_id !== null) {
        // Set a new manual discount
        const durationMinutes = 10; // Match automatic discount duration
        const endTimeForDiscount = new Date(Date.now() + durationMinutes * 60000).toISOString();

        db.prepare('INSERT INTO discount (id, drink_id, end_time) VALUES (1, ?, ?)').run(drink_id, endTimeForDiscount);

        db.close();
        return res.status(200).json({ success: true, message: `Manueller Rabatt für Getränk ${drink_id} gesetzt.` });
      }

      // If neither clear nor drink_id is provided
      db.close();
      return res.status(400).json({ success: false, message: "Ungültige Anfrage." });

    } catch (error) {
      console.error("Fehler bei manuellem Rabatt:", error);
      db.close();
      return res.status(500).json({ success: false, message: "Fehler bei der Datenbankoperation." });
    }
  } else {
    // Only POST requests are allowed
    res.status(405).json({ message: 'Method not allowed' });
  }
}
