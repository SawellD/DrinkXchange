const { openDatabase } = require("./database.cjs");

function evaluateSales() {
  const db = openDatabase();
  try {
    const rows = db.prepare("SELECT drink_id, SUM(amount) AS total_sold FROM sales_temp GROUP BY drink_id").all();
    if (rows.length === 0) return { success: true, discounted: null, message: "Keine Verkäufe seit letzter Auswertung." };

    const leastSold = rows.reduce((current, row) => (
      row.total_sold < current.total_sold ? row : current
    ));
    const endTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.transaction(() => {
      db.prepare("DELETE FROM discount").run();
      db.prepare("INSERT INTO discount (id, drink_id, end_time) VALUES (1, ?, ?)").run(leastSold.drink_id, endTime);
      db.prepare("DELETE FROM sales_temp").run();
    })();

    return { success: true, discounted: leastSold.drink_id };
  } finally {
    db.close();
  }
}

module.exports = { evaluateSales };