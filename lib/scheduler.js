"use client";

import { useState, useEffect } from "react";

const drinks = [
  { id: 1, name: "Bier 2" },
  { id: 2, name: "Fanta Korn 4" },
  { id: 3, name: "Havanna Cola 4" },
  { id: 4, name: "Aperol Spritz 4" },
  { id: 5, name: "Lillet 4" },
];

export default function HighlightPage() {
  const [discountDrink, setDiscountDrink] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [nextEval, setNextEval] = useState(1800);
  const [stats, setStats] = useState({ total: {}, temp: {} });
  const [lastEvalTime, setLastEvalTime] = useState("");

  const fetchDiscount = async () => {
    const res = await fetch("/api/discount");
    const data = await res.json();

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
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  };

  const evaluateNow = async () => {
    await fetch("/api/evaluate");
    fetchDiscount();
    fetchStats();
    const time = new Date();
    const formatted = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastEvalTime(formatted);
    setNextEval(1800);
  };

  // ⭐ Automatische Auswertung + Timer
  useEffect(() => {
    fetchDiscount();
    fetchStats();

    const now = new Date();
    const minutesPassed = now.getMinutes() % 30;
    const secondsPassed = now.getSeconds();
    const secondsToNext = (29 - minutesPassed) * 60 + (60 - secondsPassed);
    setNextEval(secondsToNext);

    const interval = setInterval(() => {
      // Rabatt-Countdown runterzählen
      setRemaining((prev) => {
        if (prev > 0) return prev - 1;
        else {
          setDiscountDrink(null);
          return 0;
        }
      });

      // Auswertungs-Countdown runterzählen
      setNextEval((prev) => {
        if (prev > 0) return prev - 1;
        else {
          evaluateNow(); // Automatische Auswertung
          return 1800;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  const formatTime = (time) => {
    if (time == null) return "--:--";
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <main className="flex flex-col justify-start items-center min-h-screen bg-yellow-100 text-center p-6">
      {discountDrink && remaining > 0 ? (
        <>
          <h1 className="text-5xl font-bold mb-6 mt-10">
            🌟 Angebot: {discountDrink.name.replace(/\s\d+$/, "")} 🌟
          </h1>
          <p className="text-3xl mb-8">
            Noch {formatTime(remaining)} Minuten!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold mt-10 mb-6">Aktuell kein Angebot aktiv</h1>
          <p className="text-2xl mb-8">
            ⏱️ Nächste Auswertung in: {formatTime(nextEval)}
          </p>
        </>
      )}

      <h2 className="text-3xl font-bold mt-4 mb-6">Statistik</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl px-4">
        {drinks.map((drink) => (
          <div
            key={drink.id}
            className="border-2 rounded-2xl shadow-xl p-6 bg-white text-gray-800"
          >
            <h3 className="text-3xl font-bold mb-2">
              {drink.name.replace(/\s\d+$/, "")}
            </h3>
            <p className="text-xl mb-4">
              Preis:{" "}
              <span className="font-semibold">
                {drink.name.match(/\d+$/)?.[0]} Marken
              </span>
            </p>
            <div className="text-lg space-y-1">
              <p>
                🍺 Gesamt:{" "}
                <span className="font-semibold">
                  {stats.total?.[drink.id] || 0} verkauft
                </span>
              </p>
              <p>
                ⏱️ Seit letzter Auswertung:{" "}
                <span className="font-semibold">
                  {stats.temp?.[drink.id] || 0} verkauft
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Letzte Auswertung */}
      <p className="text-xl mt-8 mb-4">
        📊 Letzte Auswertung:{" "}
        <span className="font-semibold">
          {lastEvalTime || "Noch keine durchgeführt"}
        </span>
      </p>

      {/* Jetzt auswerten Button */}
      <button
        onClick={evaluateNow}
        className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xl shadow hover:bg-blue-700 transition"
      >
        Jetzt auswerten
      </button>
    </main>
  );
}
