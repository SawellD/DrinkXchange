// pages/highlight.js
"use client";

import { useState, useEffect, useRef } from "react"; // Keep useRef for now, might remove if not needed
import { drinks } from "../lib/drinks"; // Import the centralized drinks data

export default function HighlightPage() {
  const [discountDrink, setDiscountDrink] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [nextEval, setNextEval] = useState(1800);
  const [stats, setStats] = useState({ total: {}, temp: {} });
  const [isNearNextOffer, setIsNearNextOffer] = useState(false);

  // Use a ref to track the ID of the drink that is *currently* causing the animation to be active.
  // This is different from the last *animated* ID.
  const animatingDrinkId = useRef(null);

  // Adjust scroll duration based on number of drinks
  const calculateScrollDuration = (drinkCount) => drinkCount * 8;

  const fetchDiscount = async () => {
    const res = await fetch("/api/discount");
    const data = await res.json();

    // Find the drink based on the fetched data
    const newDiscountDrink = data.drink_id ? drinks.find((d) => d.id === data.drink_id) : null;

    // Check if this is a new discount drink that's different from the currently displayed one
    const isNewDiscount = newDiscountDrink && (
        discountDrink?.id !== newDiscountDrink.id // Discount changed or started from null
    ) && animatingDrinkId.current !== newDiscountDrink.id; // Not already animating for this ID

    if (isNewDiscount) {
      console.log("New discount drink detected:", newDiscountDrink.id); // Log for debugging
      animatingDrinkId.current = newDiscountDrink.id; // Mark this ID as currently animating
      setTimeout(() => {
          animatingDrinkId.current = null; // Reset ref after animation duration
      }, 1000);
    } else if (!newDiscountDrink) {
        // If no discount is active, ensure the animating ref is reset
        animatingDrinkId.current = null;
    }


    // Update states based on fetched data
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

    // Calculate time until the next full or half hour for evaluation
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

      // Ensure nextEvalIn is positive, minimum 1 second to avoid infinite loop if calculation is exactly 0
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

    // Fetch stats every 2 seconds
    const statsInterval = setInterval(() => {
      fetchStats();
    }, 2000);

    // Fetch discount every 5 seconds (increased frequency)
    const discountInterval = setInterval(() => {
      fetchDiscount();
    }, 5000); // Changed from 10000 to 5000

    // Timer for discount and next evaluation countdown
    const timerInterval = setInterval(() => {
      setRemaining((prev) => {
        if (prev > 0) return prev - 1;
        else {
          // If remaining hits 0, clear the discount state immediately
          // Ensure animating ref is reset if the discount that was animating expires
          if (discountDrink && animatingDrinkId.current === discountDrink.id) {
             animatingDrinkId.current = null;
          }
          setDiscountDrink(null);
          return 0;
        }
      });

      setNextEval((prev) => {
        if (prev > 0) return prev - 1;
        else return 1800; // Reset to 30 minutes (1800 seconds)
      });

      // Check if near the next offer time (within the last 10 seconds of the 29th/59th minute)
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const isNear = ((minutes === 29 || minutes === 59) && seconds >= 50 && seconds <= 59);
      setIsNearNextOffer(isNear);
    }, 1000);


    // Cleanup intervals on component unmount
    return () => {
      clearInterval(statsInterval);
      clearInterval(discountInterval); // Clear the new interval
      clearInterval(timerInterval);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Format time in MM:SS
  const formatTime = (time) => {
    if (time == null || time < 0) return "--:--"; // Handle null or negative time
    const minutes = Math.floor(time / 60).toString().padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <main className="relative flex flex-col justify-start items-center min-h-screen bg-black text-center p-4 sm:p-6 overflow-hidden overflow-y-hidden">
      {/* Logos - Hidden on small screens, visible on medium and up */}
      <img src="/logo.png" alt="Logo" className="absolute left-2 top-2 h-32 w-32 object-contain md:h-52 md:w-52 hidden md:block" />
      <img src="/logo.png" alt="Logo" className="absolute right-2 top-2 h-32 w-32 object-contain md:h-52 md:w-52 hidden md:block" />

      {/* Main Heading - Smaller on small screens */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 mt-4 md:mt-6 text-red-600 drop-shadow-lg">
        JG Brome Getränkebörse
      </h1>

      {/* Discount Offer Text - Smaller on small screens */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 min-h-[30px] sm:min-h-[40px] md:min-h-[50px] flex items-center justify-center transition-opacity duration-700 ease-in-out">
        {discountDrink && remaining > 0 ? (
          <>
            ⭐ Angebot: <span className="text-red-600 ml-1 sm:ml-2">{discountDrink.name}</span> ⭐
          </>
        ) : (
          ""
        )}
      </h2>

      {/* Timer/Status Section - Smaller fonts on small screens */}
      <div className="flex flex-row justify-center items-center w-full mt-2 sm:mt-4 mb-10 sm:mb-20">
        <div className="text-center transition-opacity duration-700 ease-in-out">
          {/* Condition 1: Last Chance */}
          {remaining > 0 && remaining <= 30 ? (
            <p className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-yellow-400 animate-bounce animate-pulse animate-zoomIn drop-shadow-2xl">
              ⚡ LETZTE CHANCE! ⚡
            </p>
          ) : /* Condition 2: Discount Active (showing remaining time) */
          discountDrink && remaining > 0 ? (
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg text-white">
              Noch {formatTime(remaining)} Minuten!
            </p>
          ) : /* Condition 3: Near Next Offer */
          isNearNextOffer ? (
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400 animate-zoomIn drop-shadow-lg">
              ⚡ Neues Angebot gleich da!
            </p>
          ) : /* Condition 4: Time until next evaluation (when no discount is active and nextEval is counting down) */
          nextEval !== null && nextEval > 0 ? (
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              ⏱️ Nächstes Angebot in: {formatTime(nextEval)}
            </p>
          ) : (
            // If none of the above conditions are met, display nothing here.
            null
          )}
        </div>
      </div>

      {/* Stats Table Headers - Smaller fonts on small screens, adjusted grid on medium+ */}
      <div className="w-full font-[SegmentDisplay] px-2 sm:px-8">
        <div className="grid grid-cols-4 md:grid-cols-[2fr_repeat(3,1fr)] gap-0 border-b-2 sm:border-b-4 border-gray-600 pb-2 sm:pb-4 mb-3 sm:mb-6 text-neon-green text-sm sm:text-xl md:text-6xl font-bold text-center">
          <div className="border-r border-gray-600 sm:border-r-2">Getraenk</div>
          <div className="border-r border-gray-600 sm:border-r-2">Preis</div>
          <div className="border-r border-gray-600 sm:border-r-2">Gesamt</div>
          <div>Seit Auswertung</div>
        </div>
      </div>

      {/* Stats Table Content - Smaller fonts and adjusted height on small screens, adjusted grid on medium+ */}
      <div className="relative w-full h-[calc(100vh-300px)] sm:h-[660px] overflow-hidden">
        {/* Gradients */}
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
                      <span className={`${isDiscounted ? "text-red-600 font-extrabold animate-pulseHighlight text-glow-red" : "text-neon-green"}`}>
                        {drink.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-gray-600 sm:border-r-2"> {/* Use flex-col to stack prices */}
                      {isDiscounted ? (
                        <>
                          <span className="text-gray-500 line-through text-base sm:text-lg md:text-xl"> {/* Increased font size */}
                            {originalPrice} Marken
                          </span>
                          <span className="text-red-600 font-extrabold animate-pulseHighlight text-glow-red"> {/* Highlighted discounted price */}
                            {currentPrice} Marken
                          </span>
                        </>
                      ) : (
                        <span className="text-neon-green"> {/* Normal price */}
                          {currentPrice} Marken
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center border-r border-gray-600 sm:border-r-2">
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
          ))}\
        </div>
      </div>
    </main>
  );
}
