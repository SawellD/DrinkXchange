// pages/chart.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  PointElement
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Chart } from "react-chartjs-2";
import { drinks } from "../lib/drinks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  TimeScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartPage() {
  const [selectedDrinks, setSelectedDrinks] = useState(
    drinks.map((drink) => ({ value: drink.id, label: drink.name }))
  );
  const [rawSalesData, setRawSalesData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("2hrs");
  const router = useRouter();
  const chartRef = useRef(null);

  // Verkaufsdaten abrufen
  const fetchTimeSalesData = async () => {
    try {
      const res = await fetch(`/api/sales_time?range=${selectedRange}`);
      const data = await res.json();
      setRawSalesData(data.sales);
    } catch (error) {
      console.error("Fehler beim Abrufen der Verkaufsdaten:", error);
    }
  };

  useEffect(() => {
    fetchTimeSalesData();
    const interval = setInterval(() => {
      fetchTimeSalesData();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDrinks, selectedRange]);

  // Verkaufsdaten pro Getränk gruppieren
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

    for (let i = minutesBack - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 1000);
      time.setSeconds(0, 0);
      groupedData.set(time.getTime(), 0);
    }

    salesData
      .filter((sale) => sale.drink_id === drinkId)
      .forEach((sale) => {
        const saleTime = new Date(sale.timestamp.replace(" ", "T"));
        saleTime.setSeconds(0, 0);
        const key = saleTime.getTime();
        if (groupedData.has(key)) {
          groupedData.set(key, groupedData.get(key) + sale.amount);
        }
      });

    return Array.from(groupedData.entries()).map(([t, amount]) => ({
      x: new Date(Number(t)),
      y: amount,
    }));
  };

  // Dynamische Farbzuweisung für jedes Getränk
  const distinctColors = [
    "#FF5733", // Rot-Orange
    "#33FF57", // Grün
    "#3357FF", // Blau
    "#FF33A1", // Pink
    "#A133FF", // Lila
    "#FFD700"  // Goldgelb
  ];
  
  const generateColor = (id) => {
    return distinctColors[id % distinctColors.length]; 
  };
  

  // Linien-Datasets für ausgewählte Getränke
  const datasets = selectedDrinks.map((drink) => {
    const groupedData = groupSalesByMinute(rawSalesData, drink.value);
    return {
      label: drink.label,
      data: groupedData,
      borderColor: generateColor(drink.value),
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      fill: false,
    };
  });

  const timeChartData = {
    datasets: datasets,
  };

  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: { minute: "HH:mm" },
          tooltipFormat: "yyyy-MM-dd HH:mm:ss",
        },
        ticks: { autoSkip: false, maxTicksLimit: 20 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
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

  // Export als PNG
  const exportChartAsImage = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart-export.png";
      link.click();
    } else {
      alert("Chart konnte nicht exportiert werden.");
    }
  };

  // Export als CSV
  const exportDataAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Zeit,Verkäufe,Getränk\n";
    selectedDrinks.forEach((drink) => {
      const grouped = groupSalesByMinute(rawSalesData, drink.value);
      grouped.forEach(({ x, y }) => {
        csvContent += `${x.toISOString()},${y},${drink.label}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "sales_data.csv";
    link.click();
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-red-500">
        Getränke-Verkäufe
      </h1>

      <div className="mb-4 w-full max-w-md">
        <Select
          isMulti
          options={drinks.map((drink) => ({
            value: drink.id,
            label: drink.name,
          }))}
          value={selectedDrinks}
          onChange={setSelectedDrinks}
          className="text-black"
        />
      </div>

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
        <Chart ref={chartRef} type="line" data={timeChartData} options={timeChartOptions} width={"100%"} height={400} />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md mt-6">
        <button onClick={() => router.push("/")} className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 text-lg rounded-md">
          Zurück zur Startseite
        </button>
        <button onClick={exportChartAsImage} className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 text-lg rounded-md">
          Diagramm exportieren (PNG)
        </button>
        <button onClick={exportDataAsCSV} className="bg-orange-600 hover:bg-orange-800 text-white px-4 py-2 text-lg rounded-md">
          Verkaufsdaten exportieren (CSV)
        </button>
      </div>
    </main>
  );
}
