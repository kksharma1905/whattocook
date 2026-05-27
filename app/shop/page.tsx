"use client";

import { useState, useEffect } from "react";
import {
  getShoppingItems, addShoppingItem, updateShoppingItem, deleteShoppingItem,
  type StoredShopItem,
} from "@/lib/store";

interface AddItemForm {
  name: string;
  quantity: string;
  unit: string;
}

export default function ShopPage() {
  const [items, setItems] = useState<StoredShopItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddItemForm>({ name: "", quantity: "", unit: "" });

  useEffect(() => {
    setItems(getShoppingItems());
  }, []);

  function handleCheck(id: string, current: boolean) {
    updateShoppingItem(id, { isChecked: !current });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isChecked: !current } : i));
  }

  function handleDelete(id: string) {
    deleteShoppingItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const newItem = addShoppingItem({ ...form, name: form.name.trim(), sourceType: "PANTRY", sourceMealName: null, isChecked: false });
    setItems((prev) => [...prev, newItem]);
    setForm({ name: "", quantity: "", unit: "" });
    setShowAdd(false);
  }

  const upcomingItems = items.filter((i) => i.sourceType === "UPCOMING_MEAL");
  const pantryItems = items.filter((i) => i.sourceType === "PANTRY");

  function Section({ title, items: sectionItems }: { title: string; items: StoredShopItem[] }) {
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 12 }}>
          {title}
        </div>
        {sectionItems.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>Empty</div>
        ) : (
          sectionItems.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => handleCheck(item.id, item.isChecked)}
                style={{ width: 22, height: 22, borderRadius: 5, border: item.isChecked ? "none" : "1.5px solid var(--border)", background: item.isChecked ? "var(--primary)" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}
              >
                {item.isChecked && "✓"}
              </button>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 500, textDecoration: item.isChecked ? "line-through" : "none", color: item.isChecked ? "var(--text-muted)" : "var(--text)" }}>
                  {item.name}
                </span>
                {(item.quantity || item.unit) && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
                    {item.quantity} {item.unit}
                  </span>
                )}
                {item.sourceMealName && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>for {item.sourceMealName}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer", opacity: 0.5, padding: "0 4px" }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Shopping list</h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          + Add
        </button>
      </div>

      <div style={{ background: "#fde8e4", borderRadius: 12, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#7a2e1e" }}>
        <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", marginBottom: 4 }}>WHATTOCOOK TIP</div>
        Add items you need to pick up. Strike off what&apos;s already home.
      </div>

      {upcomingItems.length > 0 && <Section title="FROM UPCOMING MEALS" items={upcomingItems} />}
      <Section title="PANTRY & STAPLES" items={pantryItems} />

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add item</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>

            <label style={labelStyle}>Item name</label>
            <input autoFocus value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Onions" style={inputStyle} />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Quantity</label>
                <input value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="2" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Unit</label>
                <input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="kg, pkt..." style={inputStyle} />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!form.name.trim()}
              style={{ width: "100%", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 28, padding: "14px 0", fontSize: 15, fontWeight: 600, cursor: !form.name.trim() ? "default" : "pointer", opacity: !form.name.trim() ? 0.5 : 1 }}
            >
              Add to list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
  marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
  padding: "10px 12px", fontSize: 15, background: "var(--bg)", color: "var(--text)",
  marginBottom: 16, outline: "none",
};
