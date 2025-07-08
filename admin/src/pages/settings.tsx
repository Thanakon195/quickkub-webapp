import { useState } from "react";
export default function Settings() {
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [font, setFont] = useState("Inter");
  const [logo, setLogo] = useState("");
  const [siteTitle, setSiteTitle] = useState("QuickKub Payment Gateway");
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Website Settings</h1>
      <div style={{ marginTop: 24 }}>
        <label>Primary Color: </label>
        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
      </div>
      <div style={{ marginTop: 24 }}>
        <label>Font: </label>
        <select value={font} onChange={e => setFont(e.target.value)}>
          <option value="Inter">Inter</option>
          <option value="Prompt">Prompt (TH)</option>
          <option value="Roboto">Roboto</option>
        </select>
      </div>
      <div style={{ marginTop: 24 }}>
        <label>Logo URL: </label>
        <input type="text" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." style={{ width: 300 }} />
      </div>
      <div style={{ marginTop: 24 }}>
        <label>Site Title: </label>
        <input type="text" value={siteTitle} onChange={e => setSiteTitle(e.target.value)} style={{ width: 300 }} />
      </div>
      <button style={{ marginTop: 32, background: primaryColor, color: "#fff", padding: "12px 32px", borderRadius: 8, fontWeight: 700 }}>
        Save Settings
      </button>
      <div style={{ marginTop: 40, padding: 24, background: "#f1f5f9", borderRadius: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Live Preview</h2>
        <div style={{ color: primaryColor, fontFamily: font, fontSize: 28, fontWeight: 800 }}>{siteTitle}</div>
        {logo && <img src={logo} alt="logo" style={{ height: 60, marginTop: 16 }} />}
      </div>
    </div>
  );
}
