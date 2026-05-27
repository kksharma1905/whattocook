"use client";

import { useState, useEffect, useRef } from "react";
import type { RecommendationStyle } from "@/lib/types";
import { getSettings, updateSettings, type StoredSettings } from "@/lib/store";

const REC_STYLES: { value: RecommendationStyle; label: string; desc: string }[] = [
  { value: "CONTEXTUAL", label: "Contextual", desc: "Smart: factors in day-of-week, effort, meal type." },
  { value: "WEIGHTED", label: "Weighted", desc: "Favors older + higher-rated dishes." },
  { value: "RANDOM", label: "Random", desc: "Pure surprise. From the eligible pool." },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const sliderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function patch(data: Partial<StoredSettings>) {
    if (!settings) return;
    const updated = updateSettings(data);
    setSettings(updated);
  }

  function handleSliderChange(value: number) {
    if (!settings) return;
    setSettings({ ...settings, avoidRepeatDays: value });
    if (sliderTimer.current) clearTimeout(sliderTimer.current);
    sliderTimer.current = setTimeout(() => patch({ avoidRepeatDays: value }), 300);
  }

  if (!settings) {
    return <div style={{ padding: "20px 16px", color: "var(--text-muted)", fontSize: 14 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px" }}>
        Knobs & dials
      </h1>

      {/* Sacred Rule */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "18px 18px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "var(--primary)", marginBottom: 6 }}>
          THE SACRED RULE
        </div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Don&apos;t repeat for...
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span className="serif" style={{ fontSize: 52, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
            {settings.avoidRepeatDays}
          </span>
          <span style={{ fontSize: 20, color: "var(--text-muted)" }}>days</span>
        </div>
        <input
          type="range" min={1} max={30} value={settings.avoidRepeatDays}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--primary)", height: 4 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          <span>1 day</span>
          <span>30 days</span>
        </div>
      </div>

      {/* Recommendation Style */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "18px 18px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "var(--primary)", marginBottom: 14 }}>
          RECOMMENDATION STYLE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REC_STYLES.map((style) => {
            const active = settings.recommendationStyle === style.value;
            return (
              <button
                key={style.value}
                onClick={() => patch({ recommendationStyle: style.value })}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: active ? "#fde8e4" : "var(--bg)", border: active ? "1.5px solid var(--primary)" : "1.5px solid var(--border)", borderRadius: 12, cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: active ? "none" : "1.5px solid var(--border)", background: active ? "var(--primary)" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{style.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{style.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "4px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {[
          { key: "enableSnacks" as const, label: "Recommend snacks", desc: "Show a 4th card for chai-time." },
          { key: "showPhotos" as const, label: "Show dish photos", desc: "Toggle imagery globally." },
        ].map((toggle, i) => (
          <div
            key={toggle.key}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{toggle.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{toggle.desc}</div>
            </div>
            <button
              onClick={() => patch({ [toggle.key]: !settings[toggle.key] })}
              style={{ width: 44, height: 26, borderRadius: 13, background: settings[toggle.key] ? "var(--primary)" : "#d0ccc8", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
            >
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: settings[toggle.key] ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
