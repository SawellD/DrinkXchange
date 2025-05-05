import { useState } from "react";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";

export default function Debug() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handlePinSubmit = () => {
    if (pin === "2233") {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Falscher PIN!");
    }
  };

  const handleResetDatabase = async () => {
    const pinInput = prompt("Bitte PIN zum Zurücksetzen eingeben:");
    if (pinInput !== "2233") {
      alert("Falscher PIN!");
      return;
    }

    try {
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Datenbank wurde erfolgreich zurückgesetzt!");
      } else {
        alert("Fehler beim Zurücksetzen der Datenbank.");
      }
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Datenbank:", error);
      alert("Fehler beim Zurücksetzen der Datenbank.");
    }
  };

  const handleConfetti = async () => {
    await fetch("/api/trigger-confetti", {
      method: "POST",
    });
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
          className="mb-4 p-2 text-lg rounded-md"
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

      <div className="space-y-4">
        <button
          onClick={handleResetDatabase}
          className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Datenbank zurücksetzen
        </button>

        <button
          onClick={handleConfetti}
          className="bg-yellow-400 hover:bg-yellow-600 text-black px-4 py-2 text-lg rounded-md"
        >
          🎉 Konfetti auslösen
        </button>
      </div>

      <button
        onClick={() => router.push("/highlight")}
        className="mt-8 bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md"
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