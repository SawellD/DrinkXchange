// lib/PageConfig.js
export const PageConfig = {
  currency: "Marken", // Change your Currency here
  title: "JG Brome Getränkebörse", // Title Visible on the Highlight Page
  titleColor: "#dc2626",    // Color of the Title on the Highlight Page in HEX
  language: "de", // "de" = german, "en" = english
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
      lastchance: " ⚡ Letze Chance! ⚡",
      Offer: "Angebot:",
      remaining: "Noch",
      minutes: "Minuten !",
      nextoffer: "⚡ Neues Angebot gleich da!",
      nextofferin: "⏱️ Nächstes Angebot in:",
      drink:"Getraenk",
      price:"Preis",
      total:"Gesamt",
      sinceOffer:"Seit Auswertung"

    
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
      sinceOffer:"Since Offer"
    },
  },
};
