"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

const drinks = [
  { id: 1, name: "Bier/Alster 2" },
  { id: 2, name: "Lillet/Weinschorle 3" },
  { id: 3, name: "Mischgetraenk Korn 4" },
  { id: 4, name: "Mischgetraenk Havanna 4" },
  { id: 5, name: "Mischgetraenk Veterano 4" },
  { id: 6, name: "Mischgetraenk Vodka 4" },
];

export default function HighlightPage() {
  const [discountDrink, setDiscountDrink] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [nextEval, setNextEval] = useState(1800);
  const [stats, setStats] = useState({ total: {}, temp: {} });
  const [prevDiscountDrinkId, setPrevDiscountDrinkId] = useState(null);
  const [isNearNextOffer, setIsNearNextOffer] = useState(false);
  const [flash, setFlash] = useState(false);

  const triggerConfetti = () => {
    confetti({ particleCount: 150, angle: 45, spread: 90, origin: { x: 0, y: 0.5 } });
    confetti({ particleCount: 150, angle: 135, spread: 90, origin: { x: 1, y: 0.5 } });
  };

  const calculateScrollDuration = (drinkCount) => drinkCount * 8;

  const fetchDiscount = async () => {
    const res = await fetch("/api/discount");
    const data = await res.json();

    if (data.drink_id) {
      const drink = drinks.find((d) => d.id === data.drink_id);

      if (!discountDrink || discountDrink.id !== data.drink_id) {
        triggerConfetti();
        setFlash(true);
        setTimeout(() => setFlash(false), 1000);
      }

      if (discountDrink && discountDrink.id !== data.drink_id) {
        setPrevDiscountDrinkId(discountDrink.id);
      }
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

  useEffect(() => {
    fetchDiscount();
    fetchStats();

    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const nextFullHalfHour = ((minutes < 30 ? 30 : 60) - minutes) * 60 - seconds;
    setNextEval(nextFullHalfHour);

    const scheduleNextEvaluation = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const nextEvalIn = ((minutes < 30 ? 30 : 60) - minutes) * 60 - seconds;

      setTimeout(async () => {
        const res = await fetch("/api/evaluate", { method: "POST" });
        if (res.ok) {
          fetchDiscount();
          fetchStats();
        }
        scheduleNextEvaluation();
      }, nextEvalIn * 1000);
    };

    scheduleNextEvaluation();

    const statsInterval = setInterval(() => {
      fetchStats();
    }, 2000);

    const timerInterval = setInterval(() => {
      setRemaining((prev) => {
        if (prev > 0) return prev - 1;
        else {
          setDiscountDrink(null);
          return 0;
        }
      });

      setNextEval((prev) => {
        if (prev > 0) return prev - 1;
        else return 1800;
      });

      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const isNear = ((minutes === 29 || minutes === 59) && seconds >= 50 && seconds <= 59);

      setIsNearNextOffer(isNear);
    }, 1000);

    const eventSource = new EventSource("/api/trigger-confetti");
    eventSource.onmessage = (event) => {
      if (event.data === "confetti") {
        triggerConfetti();
      }
    };

    return () => {
      clearInterval(statsInterval);
      clearInterval(timerInterval);
      eventSource.close();
    };
  }, []);

  const formatTime = (time) => {
    if (time == null) return "--:--";
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <main className={`relative flex flex-col justify-start items-center min-h-screen bg-black text-center p-6 overflow-hidden overflow-y-hidden ${flash ? "flash-screen" : ""}`}>
      <img src="/logo.png" alt="Logo" className="absolute left-4 top-2 h-52 w-52 object-contain" />
      <img src="/logo.png" alt="Logo" className="absolute right-4 top-2 h-52 w-52 object-contain" />

      <h1 className="text-5xl font-extrabold mb-2 mt-6 text-red-600 drop-shadow-lg">
        JG Brome Getränkebörse
      </h1>

      <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2 min-h-[50px] flex items-center justify-center transition-opacity duration-700 ease-in-out">
        {discountDrink && remaining > 0 ? (
          <>
            ⭐ Angebot: <span className="text-red-600 ml-2">{discountDrink.name.replace(/\s\d+$/, "")}</span> ⭐
          </>
        ) : (
          ""
        )}
      </h2>

      <div className="flex flex-row justify-center items-center w-full mt-4 mb-20">
        <div className="text-center transition-opacity duration-700 ease-in-out">
          {remaining <= 30 && remaining > 0 ? (
            <p className="text-7xl font-extrabold text-yellow-400 animate-bounce animate-pulse animate-zoomIn drop-shadow-2xl">
              ⚡ LETZTE CHANCE! ⚡
            </p>
          ) : discountDrink && remaining > 0 ? (
            <p className="text-5xl font-bold drop-shadow-lg text-white">
              Noch {formatTime(remaining)} Minuten!
            </p>
          ) : isNearNextOffer ? (
            <p className="text-5xl font-bold text-yellow-400 animate-zoomIn drop-shadow-lg">
              ⚡ Neues Angebot gleich da!
            </p>
          ) : discountDrink === null && !isNearNextOffer && remaining !== null ? (
            <p className="text-4xl font-bold text-white drop-shadow-lg">
              ⏱️ Nächstes Angebot in: {formatTime(nextEval)}
            </p>
          ) : (
            <p className="text-4xl font-bold text-gray-400 drop-shadow-lg">
              Warte auf neues Angebot...
            </p>
          )}
        </div>
      </div>

      <div className="w-full font-[SegmentDisplay] px-8">
        <div className="grid grid-cols-4 gap-0 border-b-4 border-gray-600 pb-4 mb-6 text-neon-green text-6xl font-bold text-center">
          <div className="border-r-2 border-gray-600">Getraenk</div>
          <div className="border-r-2 border-gray-600">Preis</div>
          <div className="border-r-2 border-gray-600">Gesamt</div>
          <div>Seit Auswertung</div>
        </div>
      </div>

      <div className="relative w-full h-[660px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none"></div>

        <div
          className="scroll-content font-[SegmentDisplay] px-8 relative z-10"
          style={{ animationDuration: `${calculateScrollDuration(drinks.length)}s` }}
        >
          {[...Array(2)].map((_, index) => (
            <div key={index}>
              {drinks.map((drink) => {
                const isDiscounted = discountDrink && drink.id === discountDrink.id;
                const originalPrice = parseInt(drink.name.match(/\d+$/)?.[0], 10);
                const currentPrice = isDiscounted ? originalPrice - 1 : originalPrice;

                return (
                  <div key={drink.id + "_" + index} className="grid grid-cols-4 gap-0 border-t-2 border-gray-700 text-5xl text-center tracking-wider h-32">
                    <div className="flex items-center justify-center border-r-2 border-gray-600">
                      <span className={`${isDiscounted ? "text-red-600 font-extrabold animate-pulseHighlight text-glow-red" : "text-neon-green"}`}>
                        {drink.name.replace(/\s\d+$/, "")}
                      </span>
                    </div>
                    <div className="flex items-center justify-center border-r-2 border-gray-600">
                      <span className={`${isDiscounted ? "text-red-600 font-extrabold animate-pulseHighlight text-glow-red" : "text-neon-green"}`}>
                        {currentPrice} Marken
                      </span>
                    </div>
                    <div className="flex items-center justify-center border-r-2 border-gray-600">
                      <span className={`${isDiscounted ? "text-red-600 font-extrabold animate-pulseHighlight text-glow-red" : "text-neon-green"}`}>
                        {stats.total?.[drink.id] || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className={`${isDiscounted ? "text-red-600 font-extrabold animate-pulseHighlight text-glow-red" : "text-neon-green"}`}>
                        {stats.temp?.[drink.id] || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
