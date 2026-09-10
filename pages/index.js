// pages/index.js
"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react"; // Zahnrad-Icon aus lucide-react
import { getDefaultConfig } from "../lib/appConfig";
import { calculateTotal } from "../lib/drinkPricing";
import DrinkCard from "../components/DrinkCard";
export default function InputPage() {
  const [config, setConfig] = useState(getDefaultConfig);
  const t = config.translations[config.language];
  const drinks = config.drinks;
  const [counts, setCounts] = useState({});
  const [savedCounts, setSavedCounts] = useState({});
  const [discountDrinkId, setDiscountDrinkId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const increment = (id, amount) => {
    setCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + amount,
    }));
  };

  const reset = () => {
    setCounts({});
  };

  const undo = () => {
    setCounts(savedCounts);
  };

  const save = async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(counts),
      });

      if (!res.ok) {
        throw new Error("Speichern fehlgeschlagen!");
      }

      setSavedCounts(counts);
      setCounts({});
    } catch (error) {
      setSaveError(t.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDiscount = async () => {
    const res = await fetch("/api/discount");
    const data = await res.json();

    if (data.drink_id) {
      setDiscountDrinkId(data.drink_id);
    } else {
      setDiscountDrinkId(null);
    }
  };

  useEffect(() => {
    fetch("/api/config").then((res) => res.ok && res.json()).then((data) => data && setConfig(data));
    fetchDiscount();
    const interval = setInterval(fetchDiscount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate the total price
  const totalAmount = calculateTotal(drinks, counts, discountDrinkId, config.discountAmount);

  return (
    <main className="seller-screen">

      {/* Zahnrad-Icon oben links */}
      <div className="seller-tools">
        <button className="icon-button" onClick={() => setShowAdmin((prev) => !prev)} aria-label={t.openAdministration}>
          <Settings size={21} />
        </button>

        {/* Admin-Links */}
        {showAdmin && (
          <div className="seller-menu">
            <a href="/highlight" className="hover:underline">Highlight</a>
            <a href="/debug" className="hover:underline">Debug</a>
          </div>
        )}
      </div>

      <header className="seller-header">
        <div><p className="eyebrow">{t.sellerTerminal}</p><h1>{t.titleindex}</h1></div>
        <p className="seller-date">{new Date().toLocaleDateString()}</p>
      </header>

      {/* Getränkeliste - Multi-column grid on larger screens */}
      <div className="drink-grid">
        {drinks.map((drink) => {
          return <DrinkCard key={drink.id} drink={{ ...drink, currency: config.currency }} count={counts[drink.id] || 0} discountDrinkId={discountDrinkId} discountAmount={config.discountAmount} onIncrement={increment} />;
        })}
      </div>

      {/* Fixierte Button-Leiste */}
      <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t-2 border-gray-700">
         {/* Display Total Price */}
        <div className="total-display" aria-live="polite">
          <span className="total-label">{t.total}</span>
          <strong>{totalAmount}</strong> {config.currency}
        </div>
        {saveError && <p className="save-error" role="alert">{saveError || t.saveError}</p>}
        {/* Button Group */}
        <div className="flex gap-4 justify-center sm:justify-end sm:flex-1"> {/* Center buttons in column, push right in row */}
          <button
            className="button button--secondary"
            onClick={undo}
            type="button"
          >
            {t.undo}
          </button>

          <button
            className="button button--primary"
            onClick={save}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? "..." : t.save}
          </button>
        </div>
      </div>
    </main>
  );
}
