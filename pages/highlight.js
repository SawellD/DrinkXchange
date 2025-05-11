// pages/highlight.js
"use client";

import { useState, useEffect, useRef } from "react";
import { drinks } from "../lib/drinks";
import { PageConfig } from "../lib/PageConfig";
const t = PageConfig.translations[PageConfig.language];

export default function HighlightPage() {
  const [discountDrink, setDiscountDrink] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [nextEval, setNextEval] = useState(1800);
  const [stats, setStats] = useState({ total: {}, temp: {} });
  const [isNearNextOffer, setIsNearNextOffer] = useState(false);
  const animatingDrinkId = useRef(null);

  const calculateScrollDuration = (drinkCount) => drinkCount * 8;

  const fetchDiscount = async () => {
    const res = await fetch("/api/discount");
    const data = await res.json();
    const newDiscountDrink = data.drink_id ? drinks.find((d) => d.id === data.drink_id) : null;
    const isNewDiscount = newDiscountDrink && discountDrink?.id !== newDiscountDrink.id && animatingDrinkId.current !== newDiscountDrink.id;

    if (isNewDiscount) {
      animatingDrinkId.current = newDiscountDrink.id;
      setTimeout(() => {
        animatingDrinkId.current = null;
      }, 1000);
    } else if (!newDiscountDrink) {
      animatingDrinkId.current = null;
    }

    setDiscountDrink(newDiscountDrink);
    setRemaining(data.remaining);
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
      const delay = Math.max(1, nextEvalIn);

      setTimeout(async () => {
        const res = await fetch("/api/evaluate", { method: "POST" });
        if (res.ok) {
          fetchDiscount();
          fetchStats();
        }
        scheduleNextEvaluation();
      }, delay * 1000);
    };

    scheduleNextEvaluation();

    const statsInterval = setInterval(fetchStats, 2000);
    const discountInterval = setInterval(fetchDiscount, 5000);

    const timerInterval = setInterval(() => {
      setRemaining((prev) => {
        if (prev > 0) return prev - 1;
        if (discountDrink && animatingDrinkId.current === discountDrink.id) {
          animatingDrinkId.current = null;
        }
        setDiscountDrink(null);
        return 0;
      });

      setNextEval((prev) => (prev > 0 ? prev - 1 : 1800));

      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const isNear = ((minutes === 29 || minutes === 59) && seconds >= 50 && seconds <= 59);
      setIsNearNextOffer(isNear);
    }, 1000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(discountInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTime = (time) => {
    if (time == null || time < 0) return "--:--";
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <main className="relative flex flex-col justify-start items-center min-h-screen bg-black text-center p-4 sm:p-6 overflow-hidden overflow-y-hidden">
      {PageConfig.showLogo && (
        <>
          <img src="/logo.png" alt="Logo" className="absolute left-2 top-2 h-32 w-32 object-contain md:h-52 md:w-52 hidden md:block" />
          <img src="/logo.png" alt="Logo" className="absolute right-2 top-2 h-32 w-32 object-contain md:h-52 md:w-52 hidden md:block" />
        </>
      )}

      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 mt-4 md:mt-6 drop-shadow-lg"
        style={{ color: PageConfig.titleColor }}
      >
        {PageConfig.title}
      </h1>

      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg mb-2 min-h-[30px] sm:min-h-[40px] md:min-h-[50px] flex items-center justify-center transition-opacity duration-700 ease-in-out"
        style={{ color: PageConfig.highlightColors.headerText }}
      >
        {discountDrink && remaining > 0 ? (
          <>
            ⭐ {t.Offer} <span style={{ color: PageConfig.highlightColors.discountedText }} className="ml-1 sm:ml-2">{discountDrink.name}</span> ⭐
          </>
        ) : ""}
      </h2>

      <div className="flex flex-row justify-center items-center w-full mt-2 sm:mt-4 mb-10 sm:mb-20">
        <div className="text-center transition-opacity duration-700 ease-in-out">
          {remaining > 0 && remaining <= 30 ? (
            <p className="text-4xl sm:text-5xl md:text-7xl font-extrabold animate-bounce drop-shadow-2xl" style={{ color: PageConfig.highlightColors.warningText }}>
              {t.lastchance}
            </p>
          ) : discountDrink && remaining > 0 ? (
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg" style={{ color: PageConfig.highlightColors.countdownText }}>
              {t.remaining} {formatTime(remaining)} {t.minutes}
            </p>
          ) : isNearNextOffer ? (
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold animate-zoomIn drop-shadow-lg" style={{ color: PageConfig.highlightColors.warningText }}>
              {t.nextoffer}
            </p>
          ) : nextEval !== null && nextEval > 0 ? (
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg" style={{ color: PageConfig.highlightColors.countdownText }}>
              {t.nextofferin} {formatTime(nextEval)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="w-full font-[SegmentDisplay] px-2 sm:px-8">
        <div
          className="grid grid-cols-4 md:grid-cols-[2fr_repeat(3,1fr)] gap-0 border-b-2 sm:border-b-4 border-gray-600 pb-2 sm:pb-4 mb-3 sm:mb-6 text-sm sm:text-xl md:text-6xl font-bold text-center"
          style={{ color: PageConfig.highlightColors.headerText }}
        >
          <div className="border-r border-gray-600 sm:border-r-2">{t.drink}</div>
          <div className="border-r border-gray-600 sm:border-r-2">{t.price}</div>
          <div className="border-r border-gray-600 sm:border-r-2">{t.total}</div>
          <div>{t.sinceOffer}</div>
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-300px)] sm:h-[660px] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-8 sm:h-16 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 sm:h-16 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none"></div>

        <div
          className="scroll-content font-[SegmentDisplay] px-2 sm:px-8 relative z-10"
          style={{ animationDuration: `${calculateScrollDuration(drinks.length)}s` }}
        >
          {[...Array(2)].map((_, index) => (
            <div key={index}>
              {drinks.map((drink) => {
                const isDiscounted = discountDrink && drink.id === discountDrink.id;
                const originalPrice = drink.price;
                const currentPrice = isDiscounted ? originalPrice - 1 : originalPrice;

                return (
                  <div key={drink.id + "_" + index} className="grid grid-cols-4 md:grid-cols-[2fr_repeat(3,1fr)] gap-0 border-t border-gray-700 sm:border-t-2 text-sm sm:text-xl md:text-5xl text-center tracking-wider h-16 sm:h-24 md:h-32">
                    <div className="flex items-center justify-center border-r border-gray-600 sm:border-r-2">
                      <span style={{ color: isDiscounted ? PageConfig.highlightColors.discountedText : PageConfig.highlightColors.defaultText }}>
                        {drink.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-gray-600 sm:border-r-2">
                      {isDiscounted ? (
                        <>
                          <span className="text-gray-500 line-through text-base sm:text-lg md:text-xl">
                            {originalPrice} {PageConfig.currency}
                          </span>
                          <span style={{ color: PageConfig.highlightColors.discountedText }} className="font-extrabold animate-pulseHighlight">
                            {currentPrice} {PageConfig.currency}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: PageConfig.highlightColors.defaultText }}>
                          {currentPrice} {PageConfig.currency}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center border-r border-gray-600 sm:border-r-2">
                      <span style={{ color: isDiscounted ? PageConfig.highlightColors.discountedText : PageConfig.highlightColors.defaultText }}>
                        {stats.total?.[drink.id] || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span style={{ color: isDiscounted ? PageConfig.highlightColors.discountedText : PageConfig.highlightColors.defaultText }}>
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
