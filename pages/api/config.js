import bcrypt from "bcrypt";
import { openDatabase } from "../../lib/database.cjs";
import { getDefaultConfig, sanitizeConfig } from "../../lib/appConfig";

function ensureConfigTable(db) {
  db.prepare("CREATE TABLE IF NOT EXISTS app_config (id INTEGER PRIMARY KEY CHECK (id = 1), config TEXT NOT NULL)").run();
}

function readConfig(db) {
  ensureConfigTable(db);
  const row = db.prepare("SELECT config FROM app_config WHERE id = 1").get();
  if (!row) {
    const config = getDefaultConfig();
    db.prepare("INSERT INTO app_config (id, config) VALUES (1, ?)").run(JSON.stringify(config));
    return config;
  }
  try {
    return sanitizeConfig(JSON.parse(row.config));
  } catch {
    return getDefaultConfig();
  }
}

export default function handler(req, res) {
  const db = openDatabase();
  try {
    if (req.method === "GET") {
      return res.status(200).json(readConfig(db));
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const auth = db.prepare("SELECT hashed_pin FROM pin_storage WHERE id = 1").get();
    if (!auth || !bcrypt.compareSync(String(req.body?.pin || ""), auth.hashed_pin)) {
      return res.status(403).json({ error: "Falscher PIN!" });
    }

    const config = sanitizeConfig(req.body?.config || {});
    ensureConfigTable(db);
    db.prepare("INSERT INTO app_config (id, config) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET config = excluded.config").run(JSON.stringify(config));
    return res.status(200).json(config);
  } catch (error) {
    console.error("Fehler beim Laden der Konfiguration:", error);
    return res.status(500).json({ error: "Configuration error" });
  } finally {
    db.close();
  }
}