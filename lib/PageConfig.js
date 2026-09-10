// lib/PageConfig.js
export const PageConfig = {
  currency: "Marken", // Change your Currency here
  title: "JG Brome Getränkebörse", // Title Visible on the Highlight Page
  titleColor: "#dc2626",    // Color of the Title on the Highlight Page in HEX
  language: "en", // "de" = german, "en" = english
  showLogo: true, // Logo shown on the Highlight page --> set true or false 




  // Change the Text Colors on the Highlight Page
highlightColors: {                             
    defaultText: "#39ff14",     // Standard text color (e.g., prices, numbers)
    discountedText: "#f87171",  // Color for discounted drinks (e.g., red)
    headerText: "#39ff14",      // Color for table headers
    countdownText: "#ffffff",   // Color for time-based elements (e.g., countdown timer)
    warningText: "#facc15",     // Color for warning messages (e.g., "Last Chance!")
      },


//Translations
  translations: {
    de: {
      total: "Gesamt:",
      undo: "Rückgängig",
      save: "Speichern",
      titleindex: "Eingabe",
      discount: "Rabatt!",
      lastchance: " ⚡ Letzte Chance! ⚡",
      Offer: "Angebot:",
      remaining: "Noch",
      minutes: "Minuten !",
      nextoffer: "⚡ Neues Angebot gleich da!",
      nextofferin: "⏱️ Nächstes Angebot in:",
      drink:"Getränk",
      price:"Preis",
      total:"Gesamt",
      sinceOffer:"Seit Auswertung",
      wrongpin:"Falscher PIN!",
      errorsetdiscount:"Fehler beim Setzen des manuellen Rabatts:",
      errordeletediscount:"Fehler beim Löschen des Rabatts:",
      pinchanged:"PIN erfolgreich geändert!",
      error:"Fehler:",
      titledebug:"Debug-Bereich",
      enterpin:"PIN eingeben",
      confirm:"Bestätigen",
      mandiscount:"Manueller Rabatt",
      setdiscount:"Rabatt setzen (10min)",
      rmdiscount:"Rabatt löschen",
      changepin:"PIN ändern",
      enterold:"Alte PIN eingeben",
      enternew:"Neue PIN eingeben",
      chart:"Zur Chart-Seite",
      home:"Zur Startseite",
      highlight:"Zur Highlight-Seite",
      marketBoard:"LIVE-MARKTTAFEL",
      liveUpdates:"LIVE · Aktualisierung alle 2 Sek.",
      activeOffer:"AKTIVES ANGEBOT",
      nextMarketEvent:"NÄCHSTES MARKTEREIGNIS",
      sale:"ANGEBOT",
      saveAmount:"SPARE",
      sellerTerminal:"GETRÄNKEBÖRSE · VERKAUFSKASSE",
      openAdministration:"Administration öffnen",
      controlRoom:"KONTROLLZENTRALE",
      authorizedOnly:"Nur für autorisierte Bediener",
      sessionActive:"SITZUNG AKTIV",
      drinkSelection:"Getränkauswahl",
      navigation:"Navigation",
      displaySettings:"Anzeigeeinstellungen",
      language:"Sprache",
      currencyName:"Währungsname",
      discountValue:"Rabattwert",
      highlightTitle:"Highlight-Titel",
      titleColor:"Titelfarbe",
      showLogos:"Logos auf der Highlight-Seite anzeigen",
      saveSettings:"Einstellungen speichern",
      settingsSaved:"Einstellungen gespeichert.",
      english:"Englisch",
      german:"Deutsch",
      saveError:"Speichern fehlgeschlagen!",
      discountedPriceFor:"Rabattierter Preis für"
      ,salesManagement:"Verkäufe verwalten"
      ,resetSales:"Alle Verkäufe auf 0 setzen"
      ,overwriteSales:"Verkaufswerte speichern"
      ,totalSales:"Gesamtverkäufe"
      ,currentSales:"Seit letzter Auswertung"
      ,backupDatabase:"Datenbank sichern"
      ,manageDrinks:"Getränke verwalten"
      ,newDrink:"Neues Getränk"
      ,newPrice:"Neuer Preis"
      ,nameLabel:"Name"
      ,priceLabel:"Preis"
      ,deleteDrink:"Getränk löschen"
      ,addDrink:"Hinzufügen"
      ,chartTitle:"Getränkeverkäufe"
      ,last24Hours:"Letzte 24 Stunden"
      ,last3Hours:"Letzte 3 Stunden"
      ,lastHour:"Letzte Stunde"
      ,last10Minutes:"Letzte 10 Minuten"
      ,backHome:"Zur Startseite"
      ,exportPng:"Diagramm als PNG exportieren"
      ,exportCsv:"Verkaufsdaten als CSV exportieren"



    
    },
    en: {
      total: "Total:",
      undo: "Undo",
      save: "Save",
      titleindex: "Input",
      discount: "Discount!",
      lastchance: " ⚡ Last Chance! ⚡",
      Offer: "Offer:",
      remaining: "Still",
      minutes: "Minutes !",
      nextoffer: "⚡ Next offer right here!",
      nextofferin: "⏱️ Next Offer in:",
      drink:"Drink",
      price:"Price",
      total:"Total",
      sinceOffer:"Since Offer",
      wrongpin:"Incorrect PIN!",
      errorsetdiscount:"Error setting the manual discount:",
      errordeletediscount:"Error deleting the discount:",
      pinchanged:"PIN successfully changed!",
      error:"Error:",
      titledebug:"Debug area",
      enterpin:"Enter PIN",
      confirm:"Confirm",
      mandiscount:"Manual discount",
      setdiscount:"Set discount (10min)",
      rmdiscount:"Remove discount",
      changepin:"Change PIN",
      enterold:"Enter old PIN",
      enternew:"Enter new PIN",
      chart:"To chart page",
      home:"To home page",
      highlight:"To highlight page",
      marketBoard:"LIVE MARKET BOARD",
      liveUpdates:"LIVE · updates every 2 sec",
      activeOffer:"TODAY'S ACTIVE OFFER",
      nextMarketEvent:"NEXT MARKET EVENT",
      sale:"SALE",
      saveAmount:"SAVE",
      sellerTerminal:"DRINKXCHANGE · SELLER TERMINAL",
      openAdministration:"Open administration",
      controlRoom:"CONTROL ROOM",
      authorizedOnly:"Authorized operators only",
      sessionActive:"SESSION ACTIVE",
      drinkSelection:"Drink selection",
      navigation:"Navigation",
      displaySettings:"Display settings",
      language:"Language",
      currencyName:"Currency name",
      discountValue:"Discount value",
      highlightTitle:"Highlight title",
      titleColor:"Title color",
      showLogos:"Show logos on highlight",
      saveSettings:"Save settings",
      settingsSaved:"Settings saved.",
      english:"English",
      german:"German",
      saveError:"Saving failed!",
      discountedPriceFor:"Discounted price for"
      ,salesManagement:"Manage sales"
      ,resetSales:"Reset all sales to 0"
      ,overwriteSales:"Save sales values"
      ,totalSales:"Total sales"
      ,currentSales:"Since last evaluation"
      ,backupDatabase:"Back up database"
      ,manageDrinks:"Manage drinks"
      ,newDrink:"New drink"
      ,newPrice:"New price"
      ,nameLabel:"Name"
      ,priceLabel:"Price"
      ,deleteDrink:"Delete drink"
      ,addDrink:"Add"
      ,chartTitle:"Drink sales"
      ,last24Hours:"Last 24 hours"
      ,last3Hours:"Last 3 hours"
      ,lastHour:"Last hour"
      ,last10Minutes:"Last 10 minutes"
      ,backHome:"Back to home"
      ,exportPng:"Export chart as PNG"
      ,exportCsv:"Export sales data as CSV"
    },
  },
};
