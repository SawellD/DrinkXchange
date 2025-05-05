import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'bierboerse.db');

export default function handler(req, res) {
  const db = new Database(dbPath);

  const totalRows = db
    .prepare('SELECT drink_id, SUM(amount) as total FROM sales_total GROUP BY drink_id')
    .all();

  const tempRows = db
    .prepare('SELECT drink_id, SUM(amount) as temp FROM sales_temp GROUP BY drink_id')
    .all();

  const total = {};
  totalRows.forEach((row) => {
    total[row.drink_id] = row.total;
  });

  const temp = {};
  tempRows.forEach((row) => {
    temp[row.drink_id] = row.temp;
  });

  db.close();

  res.status(200).json({ total, temp });
  const fetchDiscount = async () => {
    console.log("Lade Rabattdaten...");
    const res = await fetch("/api/discount");
    const data = await res.json();
    console.log("Rabattdaten:", data);
  
    if (data.drink_id) {
      const drink = drinks.find((d) => d.id === data.drink_id);
      setDiscountDrink(drink);
      setRemaining(data.remaining);
    } else {
      setDiscountDrink(null);
      setRemaining(null);
    }
  };
  
  const fetchStats = async () => {
    console.log("Lade Verkaufsstatistik...");
    const res = await fetch("/api/stats");
    const data = await res.json();
    console.log("Statistikdaten:", data);
    setStats(data);
  };
  
}
