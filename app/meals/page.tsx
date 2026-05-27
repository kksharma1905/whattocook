"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/lib/types";
import TagBadge from "@/components/TagBadge";
import AddMealDialog from "@/components/AddMealDialog";
import { MealImage } from "@/components/MealImage";
import {
  getMealsWithHistory, deleteMeal, toggleFavorite, addCookLog,
  type StoredMeal,
} from "@/lib/store";

type MealWithHistory = StoredMeal & { lastCookedAt: string | null; daysSinceCooked: number | null };

const TABS: Category[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
const TAB_LABELS: Record<Category, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner",
};

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<Category>("BREAKFAST");
  const [meals, setMeals] = useState<MealWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<StoredMeal | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadMeals = useCallback(() => {
    setLoading(true);
    setMeals([]);
    setMeals(getMealsWithHistory(activeTab));
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { loadMeals(); }, [loadMeals]);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    deleteMeal(id);
    setMenuOpen(null);
    loadMeals();
  }

  function handleToggleFavorite(id: string) {
    toggleFavorite(id);
    loadMeals();
  }

  function handleLogCooked(id: string) {
    addCookLog(id, activeTab);
    setMenuOpen(null);
    loadMeals();
  }

  const filtered = meals.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My recipes</h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          + Add
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 20, borderBottom: "1.5px solid var(--border)", marginBottom: 12, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); }}
            style={{
              background: "none", border: "none", padding: "8px 0", fontSize: 14, fontWeight: 600,
              color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === tab ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              cursor: "pointer", marginBottom: -1.5, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${TAB_LABELS[activeTab].toLowerCase()}...`}
        style={{
          width: "100%", border: "1.5px solid var(--border)", borderRadius: 10,
          padding: "9px 12px", fontSize: 14, background: "var(--card)", color: "var(--text)",
          outline: "none", marginBottom: 12, boxSizing: "border-box",
        }}
      />

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "20px 0" }}>Loading...</div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            {filtered.length}{search ? ` of ${meals.length}` : ""} dish{filtered.length !== 1 ? "es" : ""}
          </div>
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 14 }}>
                {search ? `No results for "${search}"` : "No dishes yet. Tap '+ Add' to get started."}
              </div>
            ) : (
              filtered.map((meal, i) => (
                <div
                  key={meal.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    position: "relative",
                  }}
                >
                  <MealImage name={meal.name} initialUrl={meal.imageUrl} size={52} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{meal.name}</span>
                      {meal.isFavorite && <span style={{ color: "var(--primary)", fontSize: 14 }}>♥</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {meal.cookTime} min · {meal.difficulty}
                      {meal.lastCookedAt && ` · last cooked ${meal.daysSinceCooked}d ago`}
                      {!meal.lastCookedAt && " · never cooked"}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {meal.tags.map((t) => <TagBadge key={t} tag={t} />)}
                    </div>
                  </div>

                  <button
                    onClick={() => setMenuOpen(menuOpen === meal.id ? null : meal.id)}
                    style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", lineHeight: 1 }}
                  >
                    ⋮
                  </button>

                  {menuOpen === meal.id && (
                    <div style={{ position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 60, minWidth: 160, overflow: "hidden" }}>
                      {[
                        { label: meal.isFavorite ? "Unfavorite" : "Mark favorite", onClick: () => { handleToggleFavorite(meal.id); setMenuOpen(null); } },
                        { label: "Edit", onClick: () => { setEditItem(meal); setMenuOpen(null); } },
                        { label: "Log as cooked", onClick: () => handleLogCooked(meal.id) },
                        { label: "Delete", onClick: () => handleDelete(meal.id, meal.name), danger: true },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.onClick}
                          style={{ display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", textAlign: "left", fontSize: 14, cursor: "pointer", color: item.danger ? "#e53e3e" : "var(--text)", borderBottom: "1px solid var(--border)" }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {(showAdd || editItem) && (
        <AddMealDialog
          category={activeTab}
          onClose={() => { setShowAdd(false); setEditItem(null); }}
          onSaved={loadMeals}
          editItem={editItem ?? undefined}
        />
      )}

      {menuOpen && (
        <div onClick={() => setMenuOpen(null)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
      )}
    </div>
  );
}
