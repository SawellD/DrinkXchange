import { evaluateSales } from "../../lib/evaluation.cjs";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    return res.status(200).json(evaluateSales());
  } catch (error) {
    console.error("Fehler bei der Auswertung:", error);
    return res.status(500).json({ error: "Fehler bei der Auswertung." });
  }
}
