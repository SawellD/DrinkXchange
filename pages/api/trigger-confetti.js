let clients = [];

export default function handler(req, res) {
  if (req.method === "POST") {
    // Schicke an alle offenen Clients ein Konfetti-Signal
    clients.forEach((client) => client.write("data: confetti\n\n"));
    res.status(200).end();
  } else if (req.method === "GET") {
    // Erzeuge eine dauerhafte Event-Stream-Verbindung (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Speichere diesen Client
    clients.push(res);

    // Wenn die Verbindung geschlossen wird, entferne ihn
    req.on("close", () => {
      clients = clients.filter((client) => client !== res);
    });
  } else {
    res.status(405).end();
  }
}
