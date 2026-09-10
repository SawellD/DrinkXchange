# DrinkXchange

DrinkXchange ist eine selbst gehostete Getränkebörse für Veranstaltungen, Vereine und Festivals. Verkäufer erfassen Verkäufe über eine mobile Oberfläche; eine große 16:9-Markttafel zeigt Preise, Verkaufszahlen und aktive Angebote.

## Funktionen

- Mobile Verkaufskasse mit `+1`, `+5` und `+10`
- SQLite-Verkaufsverwaltung
- Automatische Auswertung alle 30 Minuten
- Konfigurierbarer ganzzahliger Rabattwert
- Zehn-Minuten-Rabatt-Countdown
- Full-HD-Highlight-Seite im Börsenstil
- Originalpreis, neuer Preis und Ersparnis bei aktiven Rabatten
- Verkaufsdiagramm mit Zeiträumen sowie PNG/CSV-Export
- PIN-geschützter Debug- und Administrationsbereich
- Getränke und Preise bearbeiten, hinzufügen und löschen
- Verkaufswerte manuell überschreiben oder auf null setzen
- SQLite-Backup herunterladen
- Deutsch und Englisch mit UTF-8-Unterstützung
- Docker-Deployment mit Node.js 24

## Voraussetzungen

- Node.js 24 oder neuer
- Für Docker: Docker Desktop oder Docker Engine mit Compose

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Die Anwendung läuft unter `http://localhost:3000`.

## Docker

```bash
docker compose up -d --build
```

Die Anwendung ist anschließend unter `http://localhost:3000` erreichbar. Die Datenbank bleibt durch das Volume `./database:/app/database` erhalten.

Einen anderen Host-Port setzen:

```bash
PORT=8080 docker compose up -d --build
```

## Administration

Unter `/debug` stehen nach der PIN-Anmeldung folgende Bereiche zur Verfügung:

- Sprache, Währung, Rabattwert, Titel und Farben ändern
- Logos auf der Highlight-Seite ein- oder ausblenden
- Getränke, Namen und Preise verwalten
- Manuelle Rabatte setzen oder löschen
- Gesamtverkäufe und Werte seit der letzten Auswertung überschreiben
- Alle Verkäufe auf null setzen
- SQLite-Datenbank sichern
- Admin-PIN ändern

Die aktuell gesetzte Standardsprache ist Deutsch. Alle Einstellungen werden in SQLite gespeichert und bleiben nach Neustarts und Docker-Neuerstellungen erhalten.

## Datenbank und Backup

Die Datenbank liegt unter `database/bierboerse.db`. Backups können im geschützten Debug-Bereich heruntergeladen werden und sollten außerhalb des Projektordners gespeichert werden.

## Dokumentation

- [Zweisprachige GitHub-Dokumentation](GITHUB.md)
- [Modernisierungs-Workflow](MODERNIZATION.md)
