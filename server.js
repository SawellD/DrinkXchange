const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { startScheduler } = require("./lib/scheduler");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Start Cron Scheduler
  startScheduler();

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, '0.0.0.0', () => {
  console.log("> Ready on http://0.0.0.0:3000 (von außen erreichbar)");
});});
