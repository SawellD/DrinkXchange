// pages/chart.js
"use client";

import { useState, useEffect, useRef } from "react";
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
  const chartRef = useRef(null);

  // Allgemeine Verkaufsdaten abrufen
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
      console.error("Fehler beim Abrufen der allgemeinen Verkaufsdaten:", error);
    }
  };

  // Zeitbezogene Verkaufsdaten abrufen
  const fetchTimeSalesData = async () => {
    try {
      const res = await fetch(`/api/sales_time?range=${selectedRange}`);
      const data = await res.json();
      const groupedSales = groupSalesByMinute(data.sales, selectedDrink);
      setTimeSalesData(groupedSales);
    } catch (error) {
      console.error("Fehler beim Abrufen der zeitbezogenen Verkaufsdaten:", error);
    }
  };

  // Gruppierung der Verkaufsdaten pro Minute (lokale Zeit beibehalten)
  const groupSalesByMinute = (salesData, drinkId) => {
    const groupedData = new Map();
    const now = new Date();
    const timeIntervals = {
      "24hrs": 24 * 60,
      "3hrs": 3 * 60,
      "1hr": 60,
      "10min": 10,
    };
    const minutesBack = timeIntervals[selectedRange] || 120;

    // Erzeuge für die letzten 'minutesBack' Minuten einen Eintrag pro Minute
    for (let i = minutesBack - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 1000);
      time.setSeconds(0, 0);
      groupedData.set(time.getTime(), 0);
    }

    // Füge Verkaufsdaten hinzu (nur für das ausgewählte Getränk)
    salesData
      .filter((sale) => sale.drink_id === selectedDrink)
      .forEach((sale) => {
        // Ersetze das Leerzeichen im Zeitstempel, damit dieser als lokale Zeit interpretiert wird
        const saleTime = new Date(sale.timestamp.replace(" ", "T"));
        saleTime.setSeconds(0, 0);
        const key = saleTime.getTime();
        groupedData.set(key, (groupedData.get(key) || 0) + sale.amount);
      });

    return Array.from(groupedData.entries()).map(([t, amount]) => ({
      x: new Date(Number(t)),
      y: amount,
    }));
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

  const timeChartData = {
    datasets: [
      {
        label: "Verkäufe pro Minute",
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

  // Bei Auswahl "10min" wird min/max explizit gesetzt
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

  // Exportiert das Diagramm als PNG-Bild
  const exportChartAsImage = () => {
    const chart = chartRef.current;
    if (chart) {
      // Direkter Aufruf von toBase64Image, da chartRef.current die Chart-Instanz ist
      const url = chart.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart-export.png";
      link.click();
    } else {
      alert("Chart konnte nicht exportiert werden.");
    }
  };

  // Exportiert die aggregierten Verkaufsdaten als CSV
  const exportDataAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Zeit,Verkäufe\n";
    timeSalesData.forEach(({ x, y }) => {
      csvContent += `${x.toISOString()},${y}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sales_data.csv";
    link.click();
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
          ref={chartRef}
          type="bar"
          data={timeChartData}
          options={timeChartOptions}
          width={"100%"}
          height={400}
        />
      </div>

      {/* Navigationsbereich + Export-Buttons */}
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
        <button
          onClick={exportChartAsImage}
          className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Diagramm exportieren (PNG)
        </button>
        <button
          onClick={exportDataAsCSV}
          className="bg-orange-600 hover:bg-orange-800 text-white px-4 py-2 text-lg rounded-md"
        >
          Verkaufsdaten exportieren (CSV)
        </button>
      </div>
    </main>
  );
}
