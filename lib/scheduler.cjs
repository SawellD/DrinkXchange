const { evaluateSales } = require("./evaluation.cjs");

let schedulerStarted = false;

function secondsUntilNextHalfHour() {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(now.getMinutes() < 30 ? 30 : 60);
  return Math.max(1000, next.getTime() - now.getTime());
}

function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const scheduleNext = () => {
    setTimeout(() => {
      try {
        const result = evaluateSales();
        console.log(`[scheduler] Evaluation complete: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error("[scheduler] Evaluation failed:", error);
      }
      scheduleNext();
    }, secondsUntilNextHalfHour());
  };

  scheduleNext();
  console.log("[scheduler] Automatic evaluation scheduled every 30 minutes.");
}

module.exports = { evaluateSales, startScheduler };