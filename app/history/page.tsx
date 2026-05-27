"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/lib/types";
import { getCookLogs, deleteCookLog, type StoredLog } from "@/lib/store";

interface GroupedDay {
  label: string;
  dateStr: string;
  entries: StoredLog[];
}

const dotColors: Record<Category, string> = {
  BREAKFAST: "var(--dot-breakfast)",
  LUNCH: "var(--dot-lunch)",
  DINNER: "var(--dot-dinner)",
  SNACK: "var(--dot-snack)",
};

function groupByDay(entries: StoredLog[]): GroupedDay[] {
  const map = new Map<string, StoredLog[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const e of entries) {
    const d = new Date(e.cookedAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  const days: GroupedDay[] = [];
  for (const [key, dayEntries] of map.entries()) {
    const d = new Date(key);
    const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
    const label = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
    days.push({ label, dateStr: key, entries: dayEntries });
  }

  return days.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
}

export default function HistoryPage() {
  const [history, setHistory] = useState<StoredLog[]>([]);

  useEffect(() => {
    setHistory([...getCookLogs()].reverse());
  }, []);

  function handleDelete(id: string, mealName: string) {
    if (!confirm(`Remove "${mealName}" from history?`)) return;
    deleteCookLog(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }

  const grouped = groupByDay(history);

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>
        Greatest hits
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>
        A scrollable diary of every cooked meal. Used to compute the X-days exclusion.
      </p>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No cooking history yet. <br />
          Start logging meals from the Today tab.
        </div>
      ) : (
        grouped.map((day) => (
          <div key={day.dateStr} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span>{day.label}</span>
              <span style={{ fontSize: 11, fontWeight: 400 }}>{day.dateStr}</span>
            </div>

            {day.entries.map((entry) => (
              <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: dotColors[entry.mealType], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{entry.mealName}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: 2 }}>
                    {entry.mealType}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id, entry.mealName)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer", padding: "0 4px", opacity: 0.5 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
