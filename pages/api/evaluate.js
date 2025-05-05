import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const db = new Database(dbPath);

    // Hole die Verkäufe der letzten 30 Minuten
    const rows = db
      .prepare("SELECT drink_id, SUM(amount) as total_sold FROM sales_temp GROUP BY drink_id")
      .all();

    if (rows.length === 0) {
      res.status(200).json({ message: 'Keine Verkäufe seit letzter Auswertung.' });
      db.close();
      return;
    }

    // Finde das Getränk mit den wenigsten Verkäufen
    let minDrink = rows[0];
    rows.forEach((row) => {
      if (row.total_sold < minDrink.total_sold) minDrink = row;
    });

    // Setze den Rabatt für 10 Minuten
    const endTimeForDiscount = new Date(Date.now() + 10 * 60000).toISOString();

    // Lösche alle alten Rabatte, bevor der neue gesetzt wird
    db.prepare('DELETE FROM discount').run();
    db.prepare('INSERT INTO discount (id, drink_id, end_time) VALUES (1, ?, ?)').run(minDrink.drink_id, endTimeForDiscount);

    // Leere die temporären Verkaufsdaten, damit die nächste Auswertung auf frischen Daten basiert
    db.prepare('DELETE FROM sales_temp').run();
    db.close();

    // Bestätigung der erfolgreichen Auswertung
    res.status(200).json({ success: true, discounted: minDrink.drink_id });
  } else {
    // Nur POST-Anfragen sind erlaubt
    res.status(405).json({ message: 'Method not allowed' });
  }
}
