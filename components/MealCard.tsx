"use client";

import { useState } from "react";
import type { StoredMeal, Suggestion } from "@/lib/store";
import type { Category } from "@/lib/types";

// expose StoredMeal + Suggestion so callers can import from here
export type { StoredMeal, Suggestion };
import TagBadge from "./TagBadge";
import { MealImage } from "./MealImage";

const categoryLabels: Record<Category, { label: string; subtitle: string }> = {
  BREAKFAST: { label: "BREAKFAST", subtitle: "TOAST TO THE MORNING" },
  LUNCH: { label: "LUNCH", subtitle: "MIDDAY MASALA" },
  SNACK: { label: "SNACK", subtitle: "CHAI TIME" },
  DINNER: { label: "DINNER", subtitle: "CURTAIN CALL" },
};

interface MealCardProps {
  category: Category;
  item: StoredMeal;
  isCooked?: boolean;
  onCooked: () => void;
  onUndoCooked: () => void;
  onShuffle: () => void;
  isShuffling?: boolean;
  hideCookButton?: boolean;
  showPhoto?: boolean;
  daysSinceCooked?: number | null;
}

export default function MealCard({
  category,
  item,
  isCooked = false,
  onCooked,
  onUndoCooked,
  onShuffle,
  isShuffling,
  hideCookButton = false,
  showPhoto = true,
  daysSinceCooked,
}: MealCardProps) {
  const { label, subtitle } = categoryLabels[category];

  function handleCooked() {
    if (isCooked) return;
    onCooked();
  }

  return (
    <div
      className="fade-in"
      style={{
        background: "var(--card)",
        borderRadius: 16,
        padding: "16px 18px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: isCooked ? "1.5px solid #c4e8c4" : "1.5px solid transparent",
        transition: "border-color 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Cooked ribbon */}
      {isCooked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #6abf69, #a8e6a3)",
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>
          {label} · {subtitle}
        </div>
        {!isCooked && (
          <button
            onClick={onShuffle}
            disabled={isShuffling}
            style={{
              background: "#fef3cd",
              border: "none",
              borderRadius: 20,
              padding: "5px 12px",
              fontSize: 12,
              color: "#856404",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            <span className={isShuffling ? "spinning" : ""} style={{ fontSize: 13 }}>↺</span>
            Shuffle
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, margin: "8px 0 10px" }}>
        {showPhoto && (
          <MealImage name={item.name} initialUrl={item.imageUrl} size={72} dim={isCooked} />
        )}
        <div>
          <h2
            className="serif"
            style={{
              fontSize: 26,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              color: isCooked ? "var(--text-muted)" : "var(--text)",
              transition: "color 0.3s",
            }}
          >
            {item.name}
          </h2>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {item.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          · {item.cookTime} min · {item.difficulty}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>
        {daysSinceCooked != null
          ? `Last cooked ${daysSinceCooked === 0 ? "today" : `${daysSinceCooked}d ago`}`
          : "Never cooked"}
      </div>

      {!isCooked ? (
        <div style={{ display: "flex", gap: 10 }}>
          {!hideCookButton && (
            <button
              onClick={handleCooked}
              style={{
                flex: 1,
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 28,
                padding: "13px 0",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              I cooked this ✓
            </button>
          )}
          <button
            onClick={onShuffle}
            disabled={isShuffling}
            style={{
              flex: hideCookButton ? 1 : 0.9,
              background: "transparent",
              color: "var(--text)",
              border: "1.5px solid var(--border)",
              borderRadius: 28,
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {hideCookButton ? "Swap it" : "Not feeling it"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div
            style={{
              flex: 1,
              background: "#f0faf0",
              borderRadius: 28,
              padding: "13px 0",
              textAlign: "center",
              fontSize: 14,
              color: "#5a9e59",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CookCheckmark size={16} /> Cooked & logged
          </div>
          <button
            onClick={onUndoCooked}
            style={{
              background: "#fff5f3",
              border: "1.5px solid #f0c4bc",
              borderRadius: 28,
              padding: "13px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <UndoIcon /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

function CookCheckmark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="#6abf69" />
      <path d="M4 7 L6.2 9.2 L10 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M2 5.5 C2 3 4 1.5 6.5 1.5 C9 1.5 11 3.5 11 6 C11 8.5 9 10.5 6.5 10.5 C5 10.5 3.7 9.8 3 8.7"
        stroke="var(--primary)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M2 2.5 L2 5.5 L5 5.5" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
