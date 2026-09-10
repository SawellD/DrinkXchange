const { createServer } = require("http");
const next = require("next");
const { startScheduler } = require("./lib/scheduler.cjs");

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Start Cron Scheduler
  startScheduler();

  createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const parsedUrl = {
      pathname: requestUrl.pathname,
      query: Object.fromEntries(requestUrl.searchParams),
    };
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', () => {
  console.log(`> Ready on http://0.0.0.0:${port}`);
});});
