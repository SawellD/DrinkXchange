import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = new Database(dbPath);
      const sales = req.body;

      console.log("Daten empfangen:", sales);  // <-- Debug!

      const insertTemp = db.prepare('INSERT INTO sales_temp (drink_id, amount, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)');
      const insertTotal = db.prepare('INSERT INTO sales_total (drink_id, amount, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)');

      Object.keys(sales).forEach((id) => {
        if (sales[id] > 0) {
          insertTemp.run(id, sales[id]);
          insertTotal.run(id, sales[id]);
        }
      });

      db.close();

      res.status(200).json({ success: true });

    } catch (error) {
      // <-- HIER Fehlerausgabe einfügen:
      console.error("Fehler beim Einfügen:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
