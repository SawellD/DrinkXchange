// pages/chart.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Adapter für date-fns (Zeitachse)
import { Chart } from "react-chartjs-2";
import { drinks } from "../lib/drinks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export default function ChartPage() {
  const [selectedDrink, setSelectedDrink] = useState(drinks[0]?.id || null);
  const [selectedRange, setSelectedRange] = useState("2hrs");
  const [salesData, setSalesData] = useState({ total: 0, temp: 0 });
  const [timeSalesData, setTimeSalesData] = useState([]);
  const router = useRouter();

  // Fetch allgemeine Verkaufsdaten
  const fetchSalesData = async () => {
    if (!selectedDrink) return;
    try {
      const res = await fetch(`/api/stats`);
      const data = await res.json();
      setSalesData({
        total: data.total[selectedDrink] || 0,
        temp: data.temp[selectedDrink] || 0,
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten:", error);
    }
  };

  // Fetch zeitbezogene Verkaufsdaten
  const fetchTimeSalesData = async () => {
    try {
      const res = await fetch(`/api/sales_time?range=${selectedRange}`);
      const data = await res.json();
      // Nutze die neue Gruppierungsfunktion
      const groupedSales = groupSalesByInterval(data.sales, selectedDrink);
      setTimeSalesData(groupedSales);
    } catch (error) {
      console.error("Fehler beim Abrufen der zeitbezogenen Verkäufe:", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
    fetchTimeSalesData();
    const interval = setInterval(() => {
      fetchSalesData();
      fetchTimeSalesData();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDrink, selectedRange]);

  /* 
    Gruppierung der Verkaufsdaten:
    - Wenn der Bereich "24hrs" gewählt ist, wird der binSize-Wert auf 10 (Minuten) gesetzt.
    - Für alle anderen Bereiche wird in 1-Minuten-Intervallen gruppiert.
    - Es wird eine Zeitreihe von der Startzeit (jetzt minus die gesamte Betrachtungsdauer) bis jetzt erzeugt, aufgeteilt in Bins (Intervallen).
    - Anschließend werden alle Verkäufe (nur des ausgewählten Getränks) auf das passende Intervall („Bin“) aufsummiert.
  */
  const groupSalesByInterval = (salesData, drinkId) => {
    // Bei "24hrs" 10-minütige Intervalle, ansonsten 1-Minuten-Schritte
    const binSize = selectedRange === "24hrs" ? 10 : 1;
    const timeIntervals = {
      "24hrs": 24 * 60,
      "3hrs": 3 * 60,
      "1hr": 60,
      "10min": 10,
    };
    const minutesBack = timeIntervals[selectedRange] || 120;
    const groupedData = new Map();
    const now = new Date();
    // Startzeit = jetzt minus die betrachtete Zeitdauer
    const startTime = new Date(now.getTime() - minutesBack * 60 * 1000);
    startTime.setSeconds(0, 0);

    // Erzeuge Bins in Schritten von binSize
    for (
      let t = startTime.getTime();
      t <= now.getTime();
      t += binSize * 60 * 1000
    ) {
      groupedData.set(t, 0);
    }

    // Füge Verkaufsdaten hinzu (nur für das ausgewählte Getränk)
    salesData
      .filter((sale) => sale.drink_id === drinkId)
      .forEach((sale) => {
        // Ersetze das Leerzeichen, damit der Zeitstempel als lokale Zeit interpretiert wird
        const saleTime = new Date(sale.timestamp.replace(" ", "T"));
        saleTime.setSeconds(0, 0);
        if (saleTime.getTime() < startTime.getTime()) return;
        const diff = saleTime.getTime() - startTime.getTime();
        const binIndex = Math.floor(diff / (binSize * 60 * 1000));
        const binStart = startTime.getTime() + binIndex * binSize * 60 * 1000;
        groupedData.set(binStart, (groupedData.get(binStart) || 0) + sale.amount);
      });

    const result = Array.from(groupedData.entries()).map(([t, amount]) => ({
      x: new Date(Number(t)),
      y: amount,
    }));
    result.sort((a, b) => a.x - b.x);
    return result;
  };

  const timeChartData = {
    datasets: [
      {
        label: selectedRange === "24hrs"
          ? "Verkäufe (10 Min Schritte)"
          : "Verkäufe pro Minute",
        data: timeSalesData,
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        barThickness: "flex", // Balkenbreite passt sich automatisch an
        maxBarThickness: 40,
      },
    ],
  };

  // Konfiguration der X-Achse
  const xAxisOptions = {
    type: "time",
    time: {
      unit: "minute",
      displayFormats: { minute: "HH:mm" },
      tooltipFormat: "yyyy-MM-dd HH:mm:ss",
    },
    ticks: { autoSkip: false, maxTicksLimit: 20 },
    grid: { color: "rgba(255,255,255,0.1)" },
  };

  // Falls "10min" gewählt ist, werden hier explizit die min/max-Werte gesetzt:
  if (selectedRange === "10min") {
    xAxisOptions.min = new Date(Date.now() - 10 * 60 * 1000);
    xAxisOptions.max = new Date();
  }

  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: xAxisOptions,
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
    plugins: {
      legend: { labels: { color: "white" } },
      tooltip: { mode: "index", intersect: false },
    },
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-red-500">Getränke-Verkäufe</h1>

      <select
        value={selectedDrink}
        onChange={(e) => setSelectedDrink(Number(e.target.value))}
        className="p-2 mb-4 bg-gray-800 text-white rounded-md"
      >
        {drinks.map((drink) => (
          <option key={drink.id} value={drink.id}>
            {drink.name}
          </option>
        ))}
      </select>

      <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
        className="p-2 mb-4 bg-gray-800 text-white rounded-md"
      >
        <option value="24hrs">Letzte 24 Stunden</option>
        <option value="3hrs">Letzte 3 Stunden</option>
        <option value="1hr">Letzte 1 Stunde</option>
        <option value="10min">Letzte 10 Minuten</option>
      </select>

      <div className="w-full bg-gray-900 p-4 rounded-lg shadow-lg mb-4">
        <Chart
          type="bar"
          data={timeChartData}
          options={timeChartOptions}
          width={"100%"}
          height={400}
        />
      </div>

      {/* Navigationsbereich */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => router.push("/highlight")}
          className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Zur Highlight-Seite
        </button>
        <button
          onClick={() => router.push("/debug")}
          className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Zum Debug-Bereich
        </button>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Zurück zur Startseite
        </button>
      </div>
    </main>
  );
}
