import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "bierboerse.db");

export default function handler(req, res) {
  try {
    const db = new Database(dbPath);
    const { range } = req.query;

    // Standard-Zeitraum: Letzte 2 Stunden (Falls keine Auswahl erfolgt) – lokale Zeit verwenden
    let timeCondition = "datetime('now', '-2 hours', 'localtime')";

    switch (range) {
      case "24hrs":
        timeCondition = "datetime('now', '-24 hours', 'localtime')";
        break;
      case "3hrs":
        timeCondition = "datetime('now', '-3 hours', 'localtime')";
        break;
      case "1hr":
        timeCondition = "datetime('now', '-1 hour', 'localtime')";
        break;
      case "10min":
        timeCondition = "datetime('now', '-10 minutes', 'localtime')";
        break;
      default:
        timeCondition = "datetime('now', '-2 hours', 'localtime')"; // Fallback
    }

    // Ändere hier den Tabellennamen von sales_temp auf sales_total
    const salesRows = db
      .prepare(`SELECT drink_id, amount, timestamp FROM sales_total WHERE timestamp >= ${timeCondition}`)
      .all();

    db.close();

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ sales: salesRows });
  } catch (error) {
    console.error("Fehler in der sales_time API:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}
