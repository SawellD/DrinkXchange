import { openDatabase } from '../../lib/database.cjs';

export default function handler(req, res) {
  try {
    const db = openDatabase();

    // Verkaufsdaten abrufen
    const totalRows = db.prepare('SELECT drink_id, SUM(amount) as total FROM sales_total GROUP BY drink_id').all();
    const tempRows = db.prepare('SELECT drink_id, SUM(amount) as temp FROM sales_temp GROUP BY drink_id').all();

    const total = {};
    totalRows.forEach((row) => {
      total[row.drink_id] = row.total;
    });

    const temp = {};
    tempRows.forEach((row) => {
      temp[row.drink_id] = row.temp;
    });

    db.close();

    // JSON-Daten zurücksenden
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ total, temp });

  } catch (error) {
    console.error("Fehler in der stats API:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}
