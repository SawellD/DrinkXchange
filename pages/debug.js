import { useState, useEffect } from "react"; 
import { useRouter } from "next/router";
import { drinks } from "../lib/drinks"; 
import { PageConfig } from "../lib/PageConfig";
const t = PageConfig.translations[PageConfig.language];

export default function Debug() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState(drinks[0]?.id || null);
  const router = useRouter();

  useEffect(() => {
    if (drinks.length > 0 && selectedDrinkId === null) {
      setSelectedDrinkId(drinks[0].id);
    }
  }, [drinks, selectedDrinkId]);

  // 🔐 PIN-Überprüfung aus der Datenbank
  const handlePinSubmit = async () => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (data.success) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage(t.wrongpin);
    }
  };

  // 🏷️ Manueller Rabatt setzen
  const handleSetManualDiscount = async () => {
    const response = await fetch("/api/manual-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drink_id: selectedDrinkId }),
    });

    const data = await response.json();
    if (data.success) {
      alert(data.message);
    } else {
      alert(t.errorsetdiscount + data.message);
    }
  };

  // ❌ Manuellen Rabatt löschen
  const handleClearManualDiscount = async () => {
    const response = await fetch("/api/manual-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true }),
    });

    const data = await response.json();
    if (data.success) {
      alert(data.message);
    } else {
      alert(t.errordeletediscount + data.message);
    }
  };

  // 🔑 PIN-Änderungsfunktion
  const [currentPin, setCurrentPin] = useState(""); // Speichert die alte PIN
const [updatedPin, setUpdatedPin] = useState(""); // Speichert die neue PIN

const handleChangePin = async () => {
  const response = await fetch("/api/changePin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPin: currentPin, newPin: updatedPin }),
  });

  const data = await response.json();
  if (data.success) {
    alert(t.pinchanged);
    setCurrentPin(""); // Eingabe zurücksetzen
    setUpdatedPin(""); // Eingabe zurücksetzen
  } else {
    alert(t.error + data.error);
  }
};


  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-bold mb-4">{t.titledebug}</h1>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder={t.enterpin}
          className="mb-4 p-2 text-lg rounded-md text-black"
        />
        <button
          onClick={handlePinSubmit}
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 text-lg rounded-md"
        >
          {t.confirm}
        </button>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6">{t.titledebug}</h1>

      {/* 🏷️ Manueller Rabatt */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-blue-400 mb-3">{t.mandiscount}</h2>
        <select
          value={selectedDrinkId || ""}
          onChange={(e) => setSelectedDrinkId(parseInt(e.target.value))}
          className="p-2 text-lg rounded-md text-black w-full"
        >
          {drinks.map((drink) => (
            <option key={drink.id} value={drink.id}>
              {drink.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSetManualDiscount}
          className="mt-4 bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md w-full"
        >
          {t.setdiscount}
        </button>
        <button
          onClick={handleClearManualDiscount}
          className="mt-4 bg-orange-600 hover:bg-orange-800 text-white px-4 py-2 text-lg rounded-md w-full"
        >
          {t.rmdiscount}
        </button>
      </div>

      {/* 🔁 Debug-Navigation */}
      <button onClick={() => router.push("/highlight")} className="mt-4 bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md">{t.highlight}</button>
      <button onClick={() => router.push("/chart")} className="mt-4 bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 text-lg rounded-md">{t.chart}</button>
      <button onClick={() => router.push("/")} className="mt-4 bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 text-lg rounded-md">{t.home}</button>

      {/* 🔑 PIN ändern (Ans Ende verschoben) */}
      <div className="mt-10 p-4 bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-blue-400 mb-3">{t.changepin}</h2>
        <input
  type="password"
  value={currentPin}
  onChange={(e) => setCurrentPin(e.target.value)}
  placeholder={t.enterold}
  className="mb-3 p-2 text-lg rounded-md text-black w-full"
/>

<input
  type="password"
  value={updatedPin}
  onChange={(e) => setUpdatedPin(e.target.value)}
  placeholder={t.enternew}
  className="mb-3 p-2 text-lg rounded-md text-black w-full"
/>

<button
  onClick={handleChangePin}
  className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md w-full"
>
  {t.changepin}
</button>

      </div>
    </div>
  );
}
