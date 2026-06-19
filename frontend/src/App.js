import React, { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

const TEMPLATES = [
  { value: "no_cost_emi", label: "No Cost EMI", message: "Hi,\n\nNo Cost EMI is now available in {city}.\n\nFor any assistance or to know more, please visit your nearest store" },
  { value: "next_day_delivery", label: "Guaranteed Next Day Delivery", message: "Hi,\n\nGuaranteed Next Day Delivery is now available in {city}.\n\nFor any assistance or to know more, please visit your nearest store" },
  { value: "custom", label: "Custom", message: "" },
];

const TOAST_DURATION = 3000;

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 999 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === "success" ? "#1a7a4a" : t.type === "error" ? "#c0392b" : "#2c2c2a",
          color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxWidth: 320,
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: active ? "#eaf3de" : "#f1efe8",
      color: active ? "#3b6d11" : "#5f5e5a",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#639922" : "#888780", display: "inline-block" }} />
      {active ? "Active" : "Paused"}
    </span>
  );
}

function CityCard({ campaign, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [template, setTemplate] = useState(campaign.template);
  const [message, setMessage] = useState(campaign.message);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTemplate(campaign.template);
    setMessage(campaign.message);
  }, [campaign]);

  function handleTemplateChange(e) {
    const selected = TEMPLATES.find((t) => t.value === e.target.value);
    setTemplate(selected.value);
    if (selected.value !== "custom") setMessage(selected.message);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(campaign.city, { template, message });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setTemplate(campaign.template);
    setMessage(campaign.message);
    setEditing(false);
  }

  const templateLabel = TEMPLATES.find((t) => t.value === campaign.template)?.label || campaign.template;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "0.5px solid #e0ddd6",
      padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: "#eeedfe",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 500, color: "#534ab7",
          }}>
            {campaign.displayName[0]}
          </div>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15 }}>{campaign.displayName}</p>
            <p style={{ fontSize: 12, color: "#888780", marginTop: 1 }}>{templateLabel}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge active={campaign.active} />
          <Toggle active={campaign.active} onChange={() => onToggle(campaign.city, !campaign.active)} />
        </div>
      </div>

      {/* Message preview */}
      {!editing && (
        <div style={{
          background: "#f5f5f3", borderRadius: 8, padding: "10px 14px",
          fontSize: 13, color: "#5f5e5a", whiteSpace: "pre-line", lineHeight: 1.6,
        }}>
          {campaign.message}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888780", display: "block", marginBottom: 5 }}>Template</label>
            <select value={template} onChange={handleTemplateChange} style={{
              width: "100%", padding: "8px 10px", borderRadius: 8,
              border: "0.5px solid #ccc", fontSize: 13, background: "#fff",
            }}>
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888780", display: "block", marginBottom: 5 }}>
              Message <span style={{ color: "#b4b2a9" }}>(use {"{city}"} as placeholder)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8,
                border: "0.5px solid #ccc", fontSize: 13, lineHeight: 1.6, resize: "vertical",
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} style={btnStyle("#fff", "#444")}>
              Edit
            </button>
            <button onClick={() => onDelete(campaign.city)} style={btnStyle("#fff", "#c0392b", "#c0392b")}>
              Delete
            </button>
          </>
        ) : (
          <>
            <button onClick={handleCancel} style={btnStyle("#fff", "#888")}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={btnStyle("#1a1a1a", "#fff")}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </>
        )}
      </div>

      {campaign.updatedAt && (
        <p style={{ fontSize: 11, color: "#b4b2a9", textAlign: "right", marginTop: -8 }}>
          Last updated: {new Date(campaign.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        </p>
      )}
    </div>
  );
}

function Toggle({ active, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, cursor: "pointer",
      background: active ? "#639922" : "#d3d1c7",
      position: "relative", transition: "background 0.2s",
      flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: active ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

function AddCityModal({ onClose, onAdd }) {
  const [city, setCity] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [template, setTemplate] = useState("no_cost_emi");
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [saving, setSaving] = useState(false);

  function handleTemplateChange(e) {
    const selected = TEMPLATES.find((t) => t.value === e.target.value);
    setTemplate(selected.value);
    if (selected.value !== "custom") setMessage(selected.message);
  }

  async function handleSubmit() {
    if (!city || !displayName) return;
    setSaving(true);
    await onAdd({ city: city.toLowerCase(), displayName, template, message });
    setSaving(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, padding: "28px 28px",
        width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontWeight: 500, fontSize: 16 }}>Add new city</p>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#888", cursor: "pointer" }}>×</button>
        </div>

        {[
          { label: "City key (lowercase, no spaces)", val: city, set: setCity, placeholder: "e.g. delhi" },
          { label: "Display name", val: displayName, set: setDisplayName, placeholder: "e.g. Delhi" },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label}>
            <label style={{ fontSize: 12, color: "#888780", display: "block", marginBottom: 5 }}>{label}</label>
            <input value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
          </div>
        ))}

        <div>
          <label style={{ fontSize: 12, color: "#888780", display: "block", marginBottom: 5 }}>Template</label>
          <select value={template} onChange={handleTemplateChange} style={{ ...inputStyle, background: "#fff" }}>
            {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#888780", display: "block", marginBottom: 5 }}>
            Message <span style={{ color: "#b4b2a9" }}>(use {"{city}"} as placeholder)</span>
          </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnStyle("#fff", "#888")}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !city || !displayName} style={btnStyle("#1a1a1a", "#fff")}>
            {saving ? "Adding..." : "Add city"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "8px 10px", borderRadius: 8,
  border: "0.5px solid #ccc", fontSize: 13,
};

function btnStyle(bg, color, borderColor) {
  return {
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    background: bg, color: color,
    border: `0.5px solid ${borderColor || color}`,
    cursor: "pointer",
  };
}

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  function toast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION);
  }

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns`);
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch {
      toast("Failed to load campaigns", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function handleToggle(city, active) {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${city}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => prev.map((c) => c.city === city ? { ...c, active } : c));
        toast(`${city} campaign ${active ? "activated" : "paused"}`);
      }
    } catch {
      toast("Failed to update", "error");
    }
  }

  async function handleSave(city, updates) {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${city}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => prev.map((c) => c.city === city ? { ...c, ...updates, updatedAt: new Date() } : c));
        toast("Campaign updated successfully");
      }
    } catch {
      toast("Failed to save changes", "error");
    }
  }

  async function handleDelete(city) {
    if (!window.confirm(`Delete campaign for ${city}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${city}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => prev.filter((c) => c.city !== city));
        toast(`${city} campaign deleted`);
      }
    } catch {
      toast("Failed to delete", "error");
    }
  }

  async function handleAdd(payload) {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast(`${payload.displayName} added`);
        setShowAdd(false);
        fetchCampaigns();
      } else {
        toast(data.message || "Failed to add city", "error");
      }
    } catch {
      toast("Failed to add city", "error");
    }
  }

  const active = campaigns.filter((c) => c.active).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e0ddd6", padding: "0 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14 }}>✦</span>
            </div>
            <span style={{ fontWeight: 500, fontSize: 15 }}>TSC Campaign Manager</span>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: "#1a1a1a", color: "#fff", border: "none",
          }}>
            + Add city
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total cities", value: campaigns.length },
            { label: "Active campaigns", value: active },
            { label: "Paused", value: campaigns.length - active },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 10, border: "0.5px solid #e0ddd6", padding: "14px 18px" }}>
              <p style={{ fontSize: 12, color: "#888780", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 24, fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888780" }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888780" }}>No campaigns yet. Add a city to get started.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {campaigns.map((c) => (
              <CityCard key={c.city} campaign={c} onToggle={handleToggle} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddCityModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      <Toast toasts={toasts} />
    </div>
  );
}
