"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react"; // Zahnrad-Icon aus lucide-react

const drinks = [
  { id: 1, name: "Bier/Alster", price: 2 },
  { id: 2, name: "Lillet/Weinschorle", price: 3 },
  { id: 3, name: "Mischgetraenk Korn", price: 4 },
  { id: 4, name: "Mischgetraenk Havanna", price: 4 },
  { id: 5, name: "Mischgetraenk Veterano", price: 4 },
  { id: 6, name: "Mischgetraenk Vodka", price: 4 },
];

export default function InputPage() {
  const [counts, setCounts] = useState({});
  const [savedCounts, setSavedCounts] = useState({});
  const [discountDrinkId, setDiscountDrinkId] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

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
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(counts),
    });

    if (res.ok) {
      setSavedCounts(counts);
      setCounts({});
    } else {
      alert("Speichern fehlgeschlagen!");
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
    fetchDiscount();
    const interval = setInterval(fetchDiscount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex flex-col min-h-screen bg-black text-white p-4">
      
      {/* Zahnrad-Icon oben links */}
      <div className="absolute top-4 left-4">
        <button onClick={() => setShowAdmin((prev) => !prev)}>
          <Settings className="text-gray-400 w-8 h-8 hover:text-white" />
        </button>

        {/* Admin-Links */}
        {showAdmin && (
          <div className="flex flex-col mt-2 text-sm text-gray-300 gap-1">
            <a href="/highlight" className="hover:underline">Highlight</a>
            <a href="/debug" className="hover:underline">Debug</a>
          </div>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-6 text-center text-red-500">
        Eingabe
      </h1>

      {/* Getränkeliste */}
      <div className="flex flex-col gap-6 pb-24">
        {drinks.map((drink) => {
          const isDiscounted = drink.id === discountDrinkId;
          const displayedPrice = isDiscounted ? drink.price - 1 : drink.price;

          return (
            <div key={drink.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{drink.name}</h2>
                  <p className="text-lg text-gray-300">
                    {displayedPrice} Marken {isDiscounted && <span className="text-red-400 font-bold ml-2">Rabatt!</span>}
                  </p>
                </div>
                <div className="text-4xl font-extrabold text-green-400">
                  {counts[drink.id] || 0}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-3xl py-4 rounded-lg"
                  onClick={() => increment(drink.id, 1)}
                >
                  +1
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-3xl py-4 rounded-lg"
                  onClick={() => increment(drink.id, 5)}
                >
                  +5
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-3xl py-4 rounded-lg"
                  onClick={() => increment(drink.id, 10)}
                >
                  +10
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixierte Button-Leiste */}
      <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex gap-4 justify-around border-t-2 border-gray-700">
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-black text-2xl font-bold py-3 px-6 rounded-lg flex-1"
          onClick={undo}
        >
          Rückgängig
        </button>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-3 px-6 rounded-lg flex-1"
          onClick={save}
        >
          Speichern
        </button>
      </div>
    </main>
  );
}
