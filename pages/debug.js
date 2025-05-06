import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/router";
import confetti from "canvas-confetti";
import { drinks } from "../lib/drinks"; // Import the centralized drinks data

export default function Debug() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDrinkId, setSelectedDrinkId] = useState(drinks[0]?.id || null); // State for selected drink
  const [actionPin, setActionPin] = useState(""); // State for PIN for actions
  const router = useRouter();

  // Set initial selected drink when drinks data is loaded
  useEffect(() => {
    if (drinks.length > 0 && selectedDrinkId === null) {
      setSelectedDrinkId(drinks[0].id);
    }
  }, [drinks, selectedDrinkId]);


  const handlePinSubmit = () => {
    if (pin === "2233") {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Falscher PIN!");
    }
  };

  const handleResetDatabase = async () => {
    if (actionPin !== "2233") { // Use actionPin for this action too
      alert("Falscher PIN!");
      return;
    }

    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: actionPin }), // Send actionPin
      });

      const data = await response.json();
      if (data.success) {
        alert("Datenbank wurde erfolgreich zurückgesetzt!");
        setActionPin(""); // Clear PIN input on success
      } else {
        alert("Fehler beim Zurücksetzen der Datenbank: " + data.message);
      }
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Datenbank:", error);
      alert("Fehler beim Zurücksetzen der Datenbank.");
    }
  };


  // New handlers for manual discount
  const handleSetManualDiscount = async () => {
     if (actionPin !== "2233") {
      alert("Falscher PIN!");
      return;
    }
    if (selectedDrinkId === null) {
        alert("Bitte ein Getränk auswählen.");
        return;
    }

    try {
      const response = await fetch("/api/manual-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: actionPin, drink_id: selectedDrinkId }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setActionPin(""); // Clear PIN input on success
      } else {
        alert("Fehler beim Setzen des manuellen Rabatts: " + data.message);
      }
    } catch (error) {
      console.error("Fehler beim Setzen des manuellen Rabatts:", error);
      alert("Fehler beim Setzen des manuellen Rabatts.");
    }
  };

  const handleClearManualDiscount = async () => {
     if (actionPin !== "2233") {
      alert("Falscher PIN!");
      return;
    }

    try {
      const response = await fetch("/api/manual-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: actionPin, clear: true }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setActionPin(""); // Clear PIN input on success
      } else {
        alert("Fehler beim Löschen des manuellen Rabatts: " + data.message);
      }
    } catch (error) {
      console.error("Fehler beim Löschen des manuellen Rabatts:", error);
      alert("Fehler beim Löschen des manuellen Rabatts.");
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-4">
        <h1 className="text-3xl font-bold mb-4">Debug-Bereich</h1>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN eingeben"
          className="mb-4 p-2 text-lg rounded-md text-black" // Added text-black for visibility
        />
        <button
          onClick={handlePinSubmit}
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Bestätigen
        </button>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Debug-Bereich</h1>

      {/* PIN Input for Actions */}
      <div className="mb-6">
         <label htmlFor="actionPin" className="block text-lg font-medium text-gray-300 mb-2">PIN für Aktionen:</label>
         <input
            id="actionPin"
            type="password"
            value={actionPin}
            onChange={(e) => setActionPin(e.target.value)}
            placeholder="PIN eingeben"
            className="p-2 text-lg rounded-md text-black w-full max-w-xs"
         />
      </div>

      {/* Manual Discount Section */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Manueller Rabatt</h2>
        <div className="flex flex-col items-center gap-4">
          <select
            value={selectedDrinkId || ''} // Use empty string for null/undefined
            onChange={(e) => setSelectedDrinkId(parseInt(e.target.value))}
            className="p-2 text-lg rounded-md text-black w-full"
          >
            {drinks.map(drink => (
              <option key={drink.id} value={drink.id}>
                {drink.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSetManualDiscount}
            className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md w-full"
          >
            Rabatt setzen (10 Min)
          </button>
          <button
            onClick={handleClearManualDiscount}
            className="bg-orange-600 hover:bg-orange-800 text-white px-4 py-2 text-lg rounded-md w-full"
          >
            Rabatt löschen
          </button>
        </div>
      </div>

      {/* Other Debug Actions */}
      <div className="space-y-4 mb-8">
        <button
          onClick={handleResetDatabase}
          className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 text-lg rounded-md w-full max-w-md"
        >
          Datenbank zurücksetzen
        </button>

      </div>

      <button
        onClick={() => router.push("/highlight")}
        className="mt-4 bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md"
      >
        Zur Highlight-Seite
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 text-lg rounded-md"
      >
        Zurück zur Startseite
      </button>
    </div>
  );
}
