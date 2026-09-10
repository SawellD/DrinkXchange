import bcrypt from "bcrypt";
import { openDatabase } from "../../lib/database.cjs";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = openDatabase();
  try {
    const auth = db.prepare("SELECT hashed_pin FROM pin_storage WHERE id = 1").get();
    if (!auth || !bcrypt.compareSync(String(req.body?.pin || ""), auth.hashed_pin)) {
      return res.status(403).json({ error: "Falscher PIN!" });
    }

    if (req.body.action === "reset") {
      db.transaction(() => {
        db.prepare("DELETE FROM sales_temp").run();
        db.prepare("DELETE FROM sales_total").run();
      })();
      return res.status(200).json({ success: true, message: "Verkäufe wurden auf 0 gesetzt." });
    }

    if (req.body.action === "overwrite") {
      const drinkId = Number(req.body.drinkId);
      const total = Math.max(0, Math.round(Number(req.body.total)));
      const temp = Math.max(0, Math.round(Number(req.body.temp)));
      if (!Number.isInteger(drinkId) || !Number.isFinite(total) || !Number.isFinite(temp)) {
        return res.status(400).json({ error: "Ungültige Verkaufswerte." });
      }

      db.transaction(() => {
        db.prepare("DELETE FROM sales_total WHERE drink_id = ?").run(drinkId);
        db.prepare("DELETE FROM sales_temp WHERE drink_id = ?").run(drinkId);
        if (total > 0) db.prepare("INSERT INTO sales_total (drink_id, amount, timestamp) VALUES (?, ?, datetime('now', 'localtime'))").run(drinkId, total);
        if (temp > 0) db.prepare("INSERT INTO sales_temp (drink_id, amount, timestamp) VALUES (?, ?, datetime('now', 'localtime'))").run(drinkId, temp);
      })();
      return res.status(200).json({ success: true, message: "Verkaufswerte gespeichert." });
    }

    return res.status(400).json({ error: "Unbekannte Verkaufsaktion." });
  } catch (error) {
    console.error("Fehler bei der Verkaufsverwaltung:", error);
    return res.status(500).json({ error: "Fehler beim Speichern der Verkäufe." });
  } finally {
    db.close();
  }
}