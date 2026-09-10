# DrinkXchange

## English

DrinkXchange is a self-hosted drink exchange web app for events, clubs, and festivals. It combines a mobile seller terminal with a Full HD market board that displays live prices, sales totals, and rotating discounts.

### Features

- Mobile-first seller interface with `+1`, `+5`, and `+10` sales buttons
- SQLite-backed sales tracking
- Automatic evaluation every 30 minutes
- Configurable discount duration and whole-number discount value
- Ten-minute active discount countdown
- Full HD 16:9 highlight board with broker-style price rows
- Clear active-offer pricing with original price, new price, and savings
- Live sales chart with selectable time ranges and PNG/CSV export
- PIN-protected administration area
- Editable drink names and prices
- Add and delete drinks from the administration area
- Manual discounts and sales reset/overwrite tools
- SQLite database backup download
- English and German interface with UTF-8 support, including `ä`, `ü`, `ö`, and `ß`
- Docker Compose deployment for Node.js 24

### Technology

- Next.js Pages Router
- React
- SQLite with `better-sqlite3`
- Chart.js
- Tailwind CSS and custom responsive CSS
- Node.js 24
- Docker Compose

### Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Docker deployment

```bash
docker compose up -d --build
```

The application is available at `http://localhost:3000`. SQLite data is persisted through the `./database:/app/database` volume. To use another host port:

```bash
PORT=8080 docker compose up -d --build
```

### Administration

Open `/debug` and authenticate with the admin PIN. The administration area can change display settings, language, currency, discount value, highlight colors, drinks, prices, sales values, and PIN. It also provides manual discount, reset, and database backup tools. Default PIN 5555

### Data and backups

The SQLite database is stored at `database/bierboerse.db`. Use the backup action in the protected administration area and store the downloaded `.db` file outside the project directory.

---

## Deutsch

DrinkXchange ist eine selbst gehostete Getränkebörsen-Web-App für Veranstaltungen, Vereine und Festivals. Sie verbindet eine mobile Verkaufskasse mit einer Full-HD-Markttafel, die Preise, Verkaufszahlen und wechselnde Rabatte live anzeigt.

### Funktionen

- Mobile Verkaufsoberfläche mit Verkaufsschaltflächen `+1`, `+5` und `+10`
- Verkaufsverwaltung mit SQLite
- Automatische Auswertung alle 30 Minuten
- Konfigurierbare Rabattdauer und ganzzahliger Rabattwert
- Zehn-Minuten-Countdown für aktive Rabatte
- Full-HD-Markttafel im 16:9-Format mit Börsenoptik
- Deutliche Angebotsanzeige mit Originalpreis, neuem Preis und Ersparnis
- Live-Verkaufsdiagramm mit auswählbaren Zeiträumen und PNG/CSV-Export
- PIN-geschützter Administrationsbereich
- Getränkenamen und Preise bearbeiten
- Getränke hinzufügen und löschen
- Manuelle Rabatte sowie Verkaufswerte zurücksetzen und überschreiben
- SQLite-Datenbank als Backup herunterladen
- Englische und deutsche Oberfläche mit UTF-8-Unterstützung für `ä`, `ü`, `ö` und `ß`
- Deployment mit Docker Compose und Node.js 24

### Technologie

- Next.js Pages Router
- React
- SQLite mit `better-sqlite3`
- Chart.js
- Tailwind CSS und eigenes responsives CSS
- Node.js 24
- Docker Compose

### Lokale Entwicklung

```bash
npm install
npm run dev
```

Die App ist anschließend unter `http://localhost:3000` erreichbar.

### Deployment mit Docker

```bash
docker compose up -d --build
```

Die Anwendung ist unter `http://localhost:3000` erreichbar. Die SQLite-Daten bleiben über das Volume `./database:/app/database` erhalten. Für einen anderen Host-Port:

```bash
PORT=8080 docker compose up -d --build
```

### Administration

`/debug` öffnen und mit der Admin-PIN anmelden. Dort lassen sich Anzeigeeinstellungen, Sprache, Währung, Rabattwert, Highlight-Farben, Getränke, Preise, Verkaufswerte und PIN ändern. Außerdem stehen manuelle Rabatte, Zurücksetzen und Datenbank-Backups zur Verfügung.Standard PIN 5555

### Daten und Backups

Die SQLite-Datenbank liegt unter `database/bierboerse.db`. Das Backup im geschützten Administrationsbereich verwenden und die heruntergeladene `.db`-Datei außerhalb des Projektordners speichern.
