"use client";

import { useState } from "react";
import type { Category, Difficulty } from "@/lib/types";
import { addMeal, updateMeal } from "@/lib/store";

const ALL_TAGS = ["VEG", "NON-VEG", "QUICK", "HEALTHY", "FESTIVE"];

interface AddMealDialogProps {
  category: Category;
  onClose: () => void;
  onSaved: () => void;
  editItem?: {
    id: string;
    name: string;
    tags: string[];
    cookTime: number;
    difficulty: string;
    notes?: string | null;
  };
}

export default function AddMealDialog({ category, onClose, onSaved, editItem }: AddMealDialogProps) {
  const [name, setName] = useState(editItem?.name ?? "");
  const [tags, setTags] = useState<string[]>(editItem?.tags ?? []);
  const [cookTime, setCookTime] = useState(editItem?.cookTime ?? 30);
  const [difficulty, setDifficulty] = useState<Difficulty>((editItem?.difficulty as Difficulty) ?? "medium");
  const [notes, setNotes] = useState(editItem?.notes ?? "");
  const [saving, setSaving] = useState(false);

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), category, tags, cookTime, difficulty, notes: notes.trim() || null };

    if (editItem) {
      updateMeal(editItem.id, payload);
    } else {
      addMeal({ ...payload, imageUrl: null, ingredients: [], isFavorite: false });
    }

    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {editItem ? "Edit dish" : "Add dish"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-muted)" }}>
            ×
          </button>
        </div>

        <label style={labelStyle}>Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Poha"
          style={inputStyle}
        />

        <label style={labelStyle}>Tags</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              style={{
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: tags.includes(t) ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                background: tags.includes(t) ? "#fde8e4" : "transparent",
                color: tags.includes(t) ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cook time (min)</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
              min={1}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} style={inputStyle}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <label style={labelStyle}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special notes..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />

        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            width: "100%",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 28,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            cursor: saving || !name.trim() ? "default" : "pointer",
            opacity: !name.trim() ? 0.5 : 1,
            marginTop: 4,
          }}
        >
          {saving ? "Saving..." : editItem ? "Save changes" : "Add dish"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: 6,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 15,
  background: "var(--bg)",
  color: "var(--text)",
  marginBottom: 16,
  outline: "none",
};
