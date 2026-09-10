// pages/highlight.js
"use client";

import { useState, useEffect, useRef } from "react";
import { getDrinkPrice } from "../lib/drinkPricing";
import { getDefaultConfig } from "../lib/appConfig";

export default function HighlightPage() {
  const [config, setConfig] = useState(getDefaultConfig);
  const t = config.translations[config.language];
  const drinks = config.drinks;
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
    fetch("/api/config").then((res) => res.ok && res.json()).then((data) => data && setConfig(data));
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
    <main className="highlight-screen">
      {config.showLogo && (
        <>
          <img src="/logo.png" alt="Logo" className="highlight-logo highlight-logo--left" />
          <img src="/logo.png" alt="Logo" className="highlight-logo highlight-logo--right" />
        </>
      )}

      <header className="highlight-header">
        <p className="market-label">{t.marketBoard} · {config.currency}</p>
        <h1
          className="highlight-title"
        style={{ color: config.titleColor }}
        >{config.title}</h1>
        <div className="market-status"><span className="status-dot" /> {t.liveUpdates}</div>
      </header>

      <section className={`highlight-offer ${discountDrink && remaining > 0 ? "highlight-offer--active" : ""}`}>
        <div className="offer-kicker">{discountDrink && remaining > 0 ? t.activeOffer : t.nextMarketEvent}</div>
        <h2
        className="offer-title"
        style={{ color: config.highlightColors.headerText }}
        >
        {discountDrink && remaining > 0 ? (
          <>
            {t.Offer} <span style={{ color: config.highlightColors.discountedText }}>{discountDrink.name}</span>
          </>
        ) : t.nextofferin}
        </h2>
        {discountDrink && remaining > 0 && (
          <div className="offer-price" aria-label={`${t.discountedPriceFor} ${discountDrink.name}`}>
            <span className="offer-price__old">{discountDrink.price} {config.currency}</span>
            <span className="offer-price__arrow">→</span>
            <strong>{getDrinkPrice(discountDrink, discountDrink.id, config.discountAmount)} {config.currency}</strong>
            <span className="offer-price__saving">{t.saveAmount} {config.discountAmount} {config.currency}</span>
          </div>
        )}
        <div className="offer-timer" style={{ color: discountDrink && remaining > 0 ? config.highlightColors.countdownText : config.highlightColors.warningText }}>
          {remaining > 0 && remaining <= 30 ? t.lastchance : discountDrink && remaining > 0 ? `${t.remaining} ${formatTime(remaining)} ${t.minutes}` : isNearNextOffer ? t.nextoffer : formatTime(nextEval)}
        </div>
      </section>

      <section className="market-board">
        <div
          className="market-board__head"
          style={{ color: config.highlightColors.headerText }}
        >
          <div>{t.drink}</div><div>{t.price}</div><div>{t.total}</div><div>{t.sinceOffer}</div>
        </div>

        <div className="market-board__viewport">
          <div className="market-board__fade market-board__fade--top" />
          <div className="market-board__fade market-board__fade--bottom" />

        <div
          className="scroll-content market-board__rows"
          style={{ animationDuration: `${calculateScrollDuration(drinks.length)}s` }}
        >
          {[...Array(2)].map((_, index) => (
            <div key={index}>
              {drinks.map((drink) => {
                const isDiscounted = discountDrink && drink.id === discountDrink.id;
                const currentPrice = getDrinkPrice(drink, discountDrink?.id, config.discountAmount);

                return (
                  <div key={drink.id + "_" + index} className={`market-row ${isDiscounted ? "market-row--discounted" : ""}`}>
                    <div className="market-row__drink">
                      <span style={{ color: isDiscounted ? config.highlightColors.discountedText : config.highlightColors.defaultText }}>
                        {drink.name}
                      </span>
                    </div>
                    <div className="market-row__price">
                      {isDiscounted ? (
                        <>
                          <span className="market-row__sale-label">{t.sale}</span>
                          <span style={{ color: config.highlightColors.discountedText }} className="market-row__current-price animate-pulseHighlight">
                            {currentPrice} {config.currency}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: config.highlightColors.defaultText }} className="market-row__current-price">
                          {currentPrice} {config.currency}
                        </span>
                      )}
                    </div>
                    <div className="market-row__metric">
                      <span style={{ color: isDiscounted ? config.highlightColors.discountedText : config.highlightColors.defaultText }}>
                        {stats.total?.[drink.id] || 0}
                      </span>
                    </div>
                    <div className="market-row__metric">
                      <span style={{ color: isDiscounted ? config.highlightColors.discountedText : config.highlightColors.defaultText }}>
                        {stats.temp?.[drink.id] || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div></div>
      </section>
    </main>
  );
}
