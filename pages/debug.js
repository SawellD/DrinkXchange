import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDefaultConfig } from "../lib/appConfig";

export default function Debug() {
  const [config, setConfig] = useState(getDefaultConfig);
  const t = config.translations[config.language];
  const drinks = config.drinks;
  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [updatedPin, setUpdatedPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDrinkId, setSelectedDrinkId] = useState(null);
  const [newDrinkName, setNewDrinkName] = useState("");
  const [newDrinkPrice, setNewDrinkPrice] = useState(1);
  const [salesValues, setSalesValues] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/config").then((res) => res.ok && res.json()).then(async (data) => {
      if (!data) return;
      setConfig(data);
      setSelectedDrinkId(data.drinks[0]?.id || null);
      const statsResponse = await fetch("/api/stats");
      const stats = await statsResponse.json();
      const values = {};
      data.drinks.forEach((drink) => {
        values[drink.id] = { total: stats.total?.[drink.id] || 0, temp: stats.temp?.[drink.id] || 0 };
      });
      setSalesValues(values);
    });
  }, []);

  const request = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  };

  const handlePinSubmit = async (event) => {
    event.preventDefault();
    const data = await request("/api/auth", { pin });
    if (data.success) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage(t.wrongpin);
    }
  };

  const handleSetManualDiscount = async () => {
    const data = await request("/api/manual-discount", { pin, drink_id: selectedDrinkId });
    setNotice(data.success ? data.message : t.errorsetdiscount + data.message);
  };

  const handleClearManualDiscount = async () => {
    const data = await request("/api/manual-discount", { pin, clear: true });
    setNotice(data.success ? data.message : t.errordeletediscount + data.message);
  };

  const refreshSales = async () => {
    const response = await fetch("/api/stats");
    const data = await response.json();
    const values = {};
    config.drinks.forEach((drink) => {
      values[drink.id] = { total: data.total?.[drink.id] || 0, temp: data.temp?.[drink.id] || 0 };
    });
    setSalesValues(values);
  };

  const handleResetSales = async () => {
    if (!window.confirm(`${t.resetSales}?`)) return;
    const data = await request("/api/sales-admin", { pin, action: "reset" });
    setNotice(data.message || data.error);
    if (data.success) refreshSales();
  };

  const handleOverwriteSales = async (drinkId) => {
    const values = salesValues[drinkId] || { total: 0, temp: 0 };
    const data = await request("/api/sales-admin", { pin, action: "overwrite", drinkId, total: values.total, temp: values.temp });
    setNotice(data.message || data.error);
    if (data.success) refreshSales();
  };

  const handleBackup = async () => {
    const response = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!response.ok) {
      const data = await response.json();
      setNotice(data.error || "Datenbankexport fehlgeschlagen.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bierboerse-backup.db";
    link.click();
    URL.revokeObjectURL(url);
    setNotice(t.backupDatabase + ": OK");
  };

  const handleChangePin = async () => {
    const data = await request("/api/changePin", { oldPin: currentPin, newPin: updatedPin });
    setNotice(data.success ? t.pinchanged : t.error + data.error);
    if (data.success) {
      setCurrentPin("");
      setUpdatedPin("");
      setPin(updatedPin);
    }
  };

  const saveConfig = async () => {
    const data = await request("/api/config", { pin, config });
    if (data.error) {
      setNotice(data.error);
      return;
    }
    setConfig(data);
    setNotice(t.settingsSaved);
  };

  const handleSaveConfig = async (event) => {
    event.preventDefault();
    await saveConfig();
  };

  const updateHighlightColor = (key, value) => {
    setConfig({
      ...config,
      highlightColors: { ...config.highlightColors, [key]: value },
    });
  };

  const updateDrink = (id, field, value) => {
    setConfig({
      ...config,
      drinks: config.drinks.map((drink) => drink.id === id ? { ...drink, [field]: field === "price" ? Number(value) : value } : drink),
    });
  };

  const addDrink = () => {
    const name = newDrinkName.trim();
    if (!name) return;
    const nextId = config.drinks.reduce((largestId, drink) => Math.max(largestId, drink.id), 0) + 1;
    setConfig({ ...config, drinks: [...config.drinks, { id: nextId, name, price: Number(newDrinkPrice) || 0 }] });
    setNewDrinkName("");
    setNewDrinkPrice(1);
  };

  const deleteDrink = (id) => {
    if (config.drinks.length <= 1) {
      setNotice("Mindestens ein Getränk muss vorhanden sein.");
      return;
    }
    setConfig({ ...config, drinks: config.drinks.filter((drink) => drink.id !== id) });
    if (selectedDrinkId === id) setSelectedDrinkId(config.drinks.find((drink) => drink.id !== id)?.id || null);
  };

  if (!isAuthenticated) {
    return (
      <main className="admin-screen admin-screen--locked">
        <form className="admin-lock-panel" onSubmit={handlePinSubmit}>
          <span className="admin-kicker">DRINKXCHANGE · {t.controlRoom}</span>
          <h1>{t.titledebug}</h1>
          <p className="admin-muted">{t.authorizedOnly}</p>
          <label className="admin-label" htmlFor="admin-pin">{t.enterpin}</label>
          <input id="admin-pin" type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value)} className="admin-input" autoFocus />
          <button type="submit" className="admin-button admin-button--primary">{t.confirm}</button>
          {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-screen">
      <header className="admin-header">
        <div><span className="admin-kicker">DRINKXCHANGE · {t.controlRoom}</span><h1>{t.titledebug}</h1></div>
        <span className="admin-session"><span className="status-dot" /> {t.sessionActive}</span>
      </header>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      <div className="admin-grid">
        <section className="admin-panel">
          <span className="panel-index">01</span><h2>{t.mandiscount}</h2>
          <label className="admin-label" htmlFor="discount-drink">{t.drinkSelection}</label>
          <select id="discount-drink" value={selectedDrinkId || ""} onChange={(event) => setSelectedDrinkId(Number(event.target.value))} className="admin-input">
            {drinks.map((drink) => <option key={drink.id} value={drink.id}>{drink.name}</option>)}
          </select>
          <div className="admin-actions">
            <button type="button" onClick={handleSetManualDiscount} className="admin-button admin-button--success">{t.setdiscount}</button>
            <button type="button" onClick={handleClearManualDiscount} className="admin-button admin-button--warning">{t.rmdiscount}</button>
          </div>
        </section>
        <section className="admin-panel">
          <span className="panel-index">02</span><h2>{t.navigation}</h2>
          <div className="admin-actions">
            <button type="button" onClick={() => router.push("/highlight")} className="admin-button admin-button--nav">{t.highlight}</button>
            <button type="button" onClick={() => router.push("/chart")} className="admin-button admin-button--nav">{t.chart}</button>
            <button type="button" onClick={() => router.push("/")} className="admin-button admin-button--nav">{t.home}</button>
          </div>
        </section>
        <section className="admin-panel">
          <span className="panel-index">03</span><h2>{t.changepin}</h2>
          <label className="admin-label" htmlFor="current-pin">{t.enterold}</label>
          <input id="current-pin" type="password" inputMode="numeric" value={currentPin} onChange={(event) => setCurrentPin(event.target.value)} className="admin-input" />
          <label className="admin-label" htmlFor="new-pin">{t.enternew}</label>
          <input id="new-pin" type="password" inputMode="numeric" value={updatedPin} onChange={(event) => setUpdatedPin(event.target.value)} className="admin-input" />
          <button type="button" onClick={handleChangePin} className="admin-button admin-button--primary">{t.changepin}</button>
        </section>
        <section className="admin-panel admin-panel--drinks">
          <span className="panel-index">05</span><h2>{t.manageDrinks}</h2>
          <div className="drink-editor-list">
            {config.drinks.map((drink) => (
              <div className="drink-editor-row" key={drink.id}>
                <input className="admin-input" aria-label={`${t.nameLabel} ${drink.name}`} value={drink.name} onChange={(event) => updateDrink(drink.id, "name", event.target.value)} />
                <input className="admin-input drink-editor-price" aria-label={`${t.priceLabel} ${drink.name}`} type="number" min="0" max="1000" step="0.5" value={drink.price} onChange={(event) => updateDrink(drink.id, "price", event.target.value)} />
                <button type="button" className="admin-button admin-button--warning" onClick={() => deleteDrink(drink.id)} aria-label={`${t.deleteDrink}: ${drink.name}`}>{t.deleteDrink}</button>
              </div>
            ))}
          </div>
          <div className="drink-editor-add">
            <input className="admin-input" placeholder={t.newDrink} value={newDrinkName} onChange={(event) => setNewDrinkName(event.target.value)} />
            <input className="admin-input drink-editor-price" aria-label={t.newPrice} type="number" min="0" max="1000" step="0.5" value={newDrinkPrice} onChange={(event) => setNewDrinkPrice(event.target.value)} />
            <button type="button" className="admin-button admin-button--success" onClick={addDrink}>{t.addDrink}</button>
          </div>
          <button type="button" className="admin-button admin-button--primary drink-editor-save" onClick={saveConfig}>{t.saveSettings}</button>
        </section>
        <section className="admin-panel admin-panel--sales">
          <span className="panel-index">06</span><h2>{t.salesManagement}</h2>
          <div className="admin-actions admin-actions--inline">
            <button type="button" className="admin-button admin-button--warning" onClick={handleResetSales}>{t.resetSales}</button>
            <button type="button" className="admin-button admin-button--nav" onClick={handleBackup}>{t.backupDatabase}</button>
          </div>
          <div className="sales-editor-list">
            {config.drinks.map((drink) => {
              const values = salesValues[drink.id] || { total: 0, temp: 0 };
              return (
                <div className="sales-editor-row" key={drink.id}>
                  <strong>{drink.name}</strong>
                  <label>{t.totalSales}<input className="admin-input" type="number" min="0" step="1" value={values.total} onChange={(event) => setSalesValues({ ...salesValues, [drink.id]: { ...values, total: Number(event.target.value) } })} /></label>
                  <label>{t.currentSales}<input className="admin-input" type="number" min="0" step="1" value={values.temp} onChange={(event) => setSalesValues({ ...salesValues, [drink.id]: { ...values, temp: Number(event.target.value) } })} /></label>
                  <button type="button" className="admin-button admin-button--nav" onClick={() => handleOverwriteSales(drink.id)}>{t.overwriteSales}</button>
                </div>
              );
            })}
          </div>
        </section>
        <form className="admin-panel admin-panel--settings" onSubmit={handleSaveConfig}>
          <span className="panel-index">04</span><h2>{t.displaySettings}</h2>
          <label className="admin-label" htmlFor="config-language">{t.language}</label>
          <select id="config-language" className="admin-input" value={config.language} onChange={(event) => setConfig({ ...config, language: event.target.value })}>
            <option value="en">{t.english}</option><option value="de">{t.german}</option>
          </select>
          <label className="admin-label" htmlFor="config-currency">{t.currencyName}</label>
          <input id="config-currency" className="admin-input" value={config.currency} onChange={(event) => setConfig({ ...config, currency: event.target.value })} maxLength={20} />
          <label className="admin-label" htmlFor="config-discount">{t.discountValue}</label>
          <input id="config-discount" className="admin-input" type="number" min="0" max="10" step="1" value={config.discountAmount} onChange={(event) => setConfig({ ...config, discountAmount: Number(event.target.value) })} />
          <label className="admin-label" htmlFor="config-title">{t.highlightTitle}</label>
          <input id="config-title" className="admin-input" value={config.title} onChange={(event) => setConfig({ ...config, title: event.target.value })} maxLength={80} />
          <label className="admin-label" htmlFor="config-title-color">{t.titleColor}</label>
          <input id="config-title-color" className="admin-color-input" type="color" value={config.titleColor} onChange={(event) => setConfig({ ...config, titleColor: event.target.value })} />
          <div className="admin-color-grid">
            {Object.entries(config.highlightColors).map(([key, value]) => (
              <label className="admin-color-field" key={key}>
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
                <input aria-label={key} className="admin-color-input" type="color" value={value} onChange={(event) => updateHighlightColor(key, event.target.value)} />
              </label>
            ))}
          </div>
          <label className="admin-check"><input type="checkbox" checked={config.showLogo} onChange={(event) => setConfig({ ...config, showLogo: event.target.checked })} /> {t.showLogos}</label>
          <button type="submit" className="admin-button admin-button--primary">{t.saveSettings}</button>
        </form>
      </div>
    </main>
  );
}