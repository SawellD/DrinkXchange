# Drinks-Exchange Web-App mit SQLite 🍻

Englisch:

A web application built for fun events and parties where drinks are sold. The app allows sellers to easily enter sold drinks, and the rest is handled automatically by the system. Every hour, at the full and half hour, the least-sold drink is automatically highlighted and offered at a reduced price for 10 minutes. The Highlight Page is optimized for use with a monitor, beamer, or TV. The app is designed to be easily accessible on smartphones with a user-friendly input menu.

Deutsch:

Eine Web-App für Veranstaltungen und Partys, bei denen Getränke verkauft werden. Die Verkäufer müssen nur die verkauften Getränke eintragen, der Rest wird automatisch vom System erledigt. Jeden Tag zur vollen und halben Stunde wird automatisch das am wenigsten verkaufte Getränk ermittelt und für 10 Minuten günstiger angeboten. Die Highlight-Seite ist für die Nutzung mit einem Monitor, Beamer oder TV optimiert. Die App ist einfach auf Smartphones zugänglich und bietet ein benutzerfreundliches Eingabemenü.

## 🇬🇧 English Version

**Features:**

- Sales are stored in a local SQLite database  
- Automatic evaluation every 30 minutes  
- Discounted drink for 10 minutes with countdown  
- Separate highlight page shows the current offer  
- Stylish Tailwind CSS layout, optimized for large screens  
- Admin view with manual discount and debug tools  
- Chart view for historical sales over time  
- PIN-protected reset and discount features  

**Customize Settings (/lib/PageConfig.js):**

- currency: Change the currency label used in the app (e.g., "Marken")
- title: Set a custom title for the Highlight page (e.g., "JG Brome Getränkebörse")
- titleColor: Set the title color in HEX (e.g., "#dc2626")
- language: App language "de" for German or "en" for English
- showLogo: Show or hide the logo on the Highlight page (true or false)
- highlightColors: Customize text colors on the Highlight page:
  - defaultText: Default text color (e.g., prices, numbers)
  - discountedText: Color for discounted drinks (e.g., red)
  - headerText: Color for table headers
  - countdownText: Color for countdown timer
  - warningText: Color for warning texts (e.g., "Last Chance!")
- 💡 **Drinks and prices** can be customized in the /lib/drinks.js file

**Important**

- Requires **Node.js v20.x**  
- ⚠️ **Node.js v21 and v22 are not supported**  
- Make sure bierboerse.db exists in the /database folder

  ## 🚀 Start

1. extract ZIP
2. install dependencies 

```bash
npm install
```

3. Start:

```bash
npm run dev
```

App is runnig at:

```
http://localhost:3000
```

## 🇩🇪 Deutsche Version

**Funktionen:**

- Verkäufe werden in einer lokalen SQLite-Datenbank gespeichert  
- Automatische Auswertung alle 30 Minuten  
- Vergünstigtes Getränk für 10 Minuten mit Countdown  
- Separate Highlight-Seite zeigt das aktuelle Angebot  
- Stilvolles Tailwind-CSS-Layout, optimiert für große Bildschirme  
- Admin-Ansicht mit manuellem Rabatt und Debug-Tools  
- Diagrammansicht für historische Verkaufszahlen  
- PIN-geschütztes Zurücksetzen und Rabattfunktionen  

**Einstellungen anpassen (`/lib/PageConfig.js`):**

- `currency`: Ändert die im System verwendete Währungsbezeichnung (z. B. `"Marken"`)  
- `title`: Setzt einen individuellen Titel für die Highlight-Seite (z. B. `"JG Brome Getränkebörse"`)  
- `titleColor`: Farbe des Titels im HEX-Format festlegen (z. B. `"#dc2626"`)  
- `language`: Sprache der App, `"de"` für Deutsch oder `"en"` für Englisch  
- `showLogo`: Logo auf der Highlight-Seite ein- oder ausblenden (`true` oder `false`)  
- `highlightColors`: Textfarben der Highlight-Seite individuell anpassen:
  - `defaultText`: Standard-Textfarbe (z. B. für Preise, Zahlen)  
  - `discountedText`: Farbe für rabattierte Getränke (z. B. Rot)  
  - `headerText`: Farbe der Tabellenüberschriften  
  - `countdownText`: Farbe des Countdowns  
  - `warningText`: Farbe für Warnhinweise (z. B. "Letzte Chance!")

💡 **Getränke und Preise** können in der Datei `/lib/drinks.js` angepasst werden  

**Wichtig**

- Benötigt **Node.js v20.x**  
- ⚠️ **Node.js v21 und v22 werden nicht unterstützt**  
- Stelle sicher, dass `bierboerse.db` im Ordner `/database` vorhanden ist


## 🚀 Start

1. ZIP entpacken
2. Abhängigkeiten installieren:

```bash
npm install
```

3. Starten:

```bash
npm run dev
```

App läuft unter:

```
http://localhost:3000
```
