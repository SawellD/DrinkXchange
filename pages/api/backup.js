import bcrypt from "bcrypt";
import fs from "fs";
import { openDatabase, databasePath } from "../../lib/database.cjs";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const db = openDatabase();
  try {
    const auth = db.prepare("SELECT hashed_pin FROM pin_storage WHERE id = 1").get();
    if (!auth || !bcrypt.compareSync(String(req.body?.pin || ""), auth.hashed_pin)) {
      return res.status(403).json({ error: "Falscher PIN!" });
    }

    db.pragma("wal_checkpoint(TRUNCATE)");
    const backup = fs.readFileSync(databasePath);
    res.setHeader("Content-Type", "application/vnd.sqlite3");
    res.setHeader("Content-Disposition", `attachment; filename="bierboerse-${new Date().toISOString().slice(0, 10)}.db"`);
    return res.status(200).send(backup);
  } catch (error) {
    console.error("Fehler beim Datenbankexport:", error);
    return res.status(500).json({ error: "Datenbankexport fehlgeschlagen." });
  } finally {
    db.close();
  }
}
