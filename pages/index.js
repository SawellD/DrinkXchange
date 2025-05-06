// pages/index.js
"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react"; // Zahnrad-Icon aus lucide-react
import { drinks } from "../lib/drinks"; // Import the centralized drinks data

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

  // Calculate the total price
  const totalAmount = Object.keys(counts).reduce((sum, drinkId) => {
    const drink = drinks.find(d => d.id === parseInt(drinkId)); // Find the drink by ID
    if (!drink) return sum; // Should not happen if IDs are consistent

    const isDiscounted = drink.id === discountDrinkId;
    const price = isDiscounted ? drink.price - 1 : drink.price;
    const quantity = counts[drinkId];

    return sum + (price * quantity);
  }, 0);


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

      {/* Getränkeliste - Multi-column grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24"> {/* Added grid classes */}
        {drinks.map((drink) => {
          const isDiscounted = drink.id === discountDrinkId;
          const displayedPrice = isDiscounted ? drink.price - 1 : drink.price;

          return (
            <div key={drink.id} className="bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md"> {/* Adjusted padding */}
              <div className="flex justify-between items-center mb-3 sm:mb-4"> {/* Adjusted margin-bottom */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">{drink.name}</h2> {/* Adjusted font size */}
                  <p className="text-base sm:text-lg text-gray-300"> {/* Adjusted font size */}
                    {displayedPrice} Marken {isDiscounted && <span className="text-red-400 font-bold ml-1 sm:ml-2">Rabatt!</span>} {/* Adjusted margin-left */}
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-green-400"> {/* Adjusted font size */}
                  {counts[drink.id] || 0}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3"> {/* Adjusted gap */}
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-2xl sm:text-3xl py-3 sm:py-4 rounded-lg" /* Adjusted font size and padding */
                  onClick={() => increment(drink.id, 1)}
                >
                  +1
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-2xl sm:text-3xl py-3 sm:py-4 rounded-lg" /* Adjusted font size and padding */
                  onClick={() => increment(drink.id, 5)}
                >
                  +5
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white text-2xl sm:text-3xl py-3 sm:py-4 rounded-lg" /* Adjusted font size and padding */
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
      <div className="fixed bottom-0 left-0 right-0 bg-black p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t-2 border-gray-700">
         {/* Display Total Price */}
        <div className="text-xl sm:text-2xl font-bold text-green-400">
          Gesamt: {totalAmount} Marken
        </div>
        {/* Button Group */}
        <div className="flex gap-4 justify-center sm:justify-end sm:flex-1"> {/* Center buttons in column, push right in row */}
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-xl sm:text-2xl font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg"
            onClick={undo}
          >
            Rückgängig
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-xl sm:text-2xl font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg"
            onClick={save}
          >
            Speichern
          </button>
        </div>
      </div>
    </main>
  );
}
