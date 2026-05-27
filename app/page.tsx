"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import MealCard from "@/components/MealCard";
import type { Category } from "@/lib/types";
import {
  getSettings, getRecommendations, getRecommendation, addCookLog,
  type StoredSettings, type Suggestion,
} from "@/lib/store";

const CATEGORIES: Category[] = ["BREAKFAST", "LUNCH", "DINNER"];
const SNACK_CATEGORIES: Category[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
const STORAGE_KEY = "wtc_suggestions_v1";
const COOKED_KEY = "wtc_cooked_v1";

type SuggestionMap = Partial<Record<Category, Suggestion | null>>;

interface StoredState {
  date: string;
  today: SuggestionMap;
  tomorrow: SuggestionMap;
}

interface CookedState {
  date: string;
  ids: string[];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDateHeader(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const label = offsetDays === 0 ? "TODAY" : "TOMORROW";
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]} · ${label}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split("T")[0];
}

// ─── DaySection lives OUTSIDE TodayPage so React never recreates the type ─────

interface DaySectionProps {
  day: "today" | "tomorrow";
  suggestions: SuggestionMap;
  shuffling: Partial<Record<Category, boolean>>;
  respinning: boolean;
  offsetDays: number;
  categories: Category[];
  cookedIds: string[];
  cookedCount: number;
  showPhotos: boolean;
  onCooked: (itemId: string, mealType: Category) => void;
  onUndoCooked: (itemId: string) => void;
  onShuffle: (day: "today" | "tomorrow", cat: Category) => void;
  onRespin: (day: "today" | "tomorrow") => void;
}

function DaySection({
  day, suggestions, shuffling, respinning, offsetDays, categories,
  cookedIds, cookedCount, showPhotos, onCooked, onUndoCooked, onShuffle, onRespin,
}: DaySectionProps) {
  const isTomorrow = day === "tomorrow";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, letterSpacing: "0.08em" }}>
          {formatDateHeader(offsetDays)}
        </div>
        {day === "today" && cookedCount > 0 && (
          <div style={{ fontSize: 11, color: "#5a9e59", fontWeight: 600 }}>
            {cookedCount}/{categories.length} cooked
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {categories.map((cat) => {
          const s = suggestions[cat];
          if (!s)
            return (
              <div key={cat} style={{ background: "var(--card)", borderRadius: 16, padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No {cat.toLowerCase()} dishes added yet.{" "}
                <Link href="/meals" style={{ color: "var(--primary)" }}>Add some →</Link>
              </div>
            );
          const isCooked = day === "today" && cookedIds.includes(s.item.id);
          return (
            <MealCard
              key={`${cat}-${s.item.id}`}
              category={cat}
              item={s.item}
              isCooked={isCooked}
              onCooked={() => onCooked(s.item.id, cat)}
              onUndoCooked={() => onUndoCooked(s.item.id)}
              onShuffle={() => onShuffle(day, cat)}
              isShuffling={shuffling[cat]}
              hideCookButton={isTomorrow}
              showPhoto={showPhotos}
              daysSinceCooked={s.daysSinceCooked}
            />
          );
        })}
      </div>

      <button
        onClick={() => !respinning && onRespin(day)}
        disabled={respinning}
        style={{
          width: "100%", background: "transparent", border: "1.5px dashed var(--border)",
          borderRadius: 28, padding: "13px 0", fontSize: 13, color: "var(--text-muted)",
          cursor: respinning ? "default" : "pointer", marginTop: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, opacity: respinning ? 0.5 : 1,
        }}
      >
        <span className={respinning ? "spinning" : ""}>↺</span>
        {respinning ? "Spinning..." : "Re-spin the whole masala"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const [today, setToday] = useState<SuggestionMap>({});
  const [tomorrow, setTomorrow] = useState<SuggestionMap>({});
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [cookedIds, setCookedIds] = useState<string[]>([]);
  const [shufflingToday, setShufflingToday] = useState<Partial<Record<Category, boolean>>>({});
  const [shufflingTomorrow, setShufflingTomorrow] = useState<Partial<Record<Category, boolean>>>({});
  const [respinningToday, setRespinningToday] = useState(false);
  const [respinningTomorrow, setRespinningTomorrow] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayRef = useRef(today);
  const tomorrowRef = useRef(tomorrow);
  const settingsRef = useRef<StoredSettings | null>(null);
  // Per-(day,category) ring buffer of recently shuffled IDs so back-to-back
  // shuffles spread across the full pool instead of bouncing between a few.
  const shuffleHistoryRef = useRef<Record<string, string[]>>({});
  useEffect(() => { todayRef.current = today; }, [today]);
  useEffect(() => { tomorrowRef.current = tomorrow; }, [tomorrow]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const initSuggestions = useCallback(() => {
    const s = getSettings();
    setSettings(s);
    settingsRef.current = s;

    const date = todayStr();

    const rawCooked = localStorage.getItem(COOKED_KEY);
    let cooked: CookedState = { date, ids: [] };
    if (rawCooked) {
      const parsed: CookedState = JSON.parse(rawCooked);
      cooked = parsed.date === date ? parsed : { date, ids: [] };
    }
    setCookedIds(cooked.ids);

    const rawStored = localStorage.getItem(STORAGE_KEY);
    let stored: StoredState | null = null;
    if (rawStored) stored = JSON.parse(rawStored) as StoredState;

    let todaySuggestions: SuggestionMap;
    let tomorrowSuggestions: SuggestionMap;

    if (stored?.date === date) {
      todaySuggestions = stored.today;
      tomorrowSuggestions = stored.tomorrow;
    } else if (stored && isYesterday(stored.date)) {
      todaySuggestions = stored.tomorrow;
      const todayIds = Object.values(stored.tomorrow).filter(Boolean).map((x) => x!.item.id);
      tomorrowSuggestions = getRecommendations(s, todayIds);
      persist(date, todaySuggestions, tomorrowSuggestions);
    } else {
      todaySuggestions = getRecommendations(s);
      const todayIds = Object.values(todaySuggestions).filter(Boolean).map((x) => x!.item.id);
      tomorrowSuggestions = getRecommendations(s, todayIds);
      persist(date, todaySuggestions, tomorrowSuggestions);
    }

    setToday(todaySuggestions);
    setTomorrow(tomorrowSuggestions);
    setLoading(false);
  }, []);

  useEffect(() => {
    initSuggestions();
  }, [initSuggestions]);

  function persist(date: string, todaySugg: SuggestionMap, tomorrowSugg: SuggestionMap) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, today: todaySugg, tomorrow: tomorrowSugg }));
  }

  function persistCooked(ids: string[]) {
    localStorage.setItem(COOKED_KEY, JSON.stringify({ date: todayStr(), ids }));
  }

  const handleCooked = useCallback((itemId: string, mealType: Category) => {
    addCookLog(itemId, mealType);
    setCookedIds((prev) => {
      const updated = [...prev, itemId];
      persistCooked(updated);
      return updated;
    });
  }, []);

  const handleUndoCooked = useCallback((itemId: string) => {
    setCookedIds((prev) => {
      const updated = prev.filter((id) => id !== itemId);
      persistCooked(updated);
      return updated;
    });
  }, []);

  const handleShuffle = useCallback((day: "today" | "tomorrow", category: Category) => {
    const setShuffling = day === "today" ? setShufflingToday : setShufflingTomorrow;
    setShuffling((p) => ({ ...p, [category]: true }));

    const sameDay = day === "today" ? todayRef.current : tomorrowRef.current;
    const otherDay = day === "today" ? tomorrowRef.current : todayRef.current;
    const currentId = sameDay[category]?.item.id;
    const otherDaySameCatId = otherDay[category]?.item.id;
    const histKey = `${day}:${category}`;
    const history = shuffleHistoryRef.current[histKey] ?? [];

    // Only block: the visible card, the same category on the other day, and the
    // most-recent ~10 shuffle results. Cross-category dupes within a day are fine.
    const excludeIds = [
      ...(currentId ? [currentId] : []),
      ...(otherDaySameCatId ? [otherDaySameCatId] : []),
      ...history,
    ];

    const s = settingsRef.current ?? getSettings();
    const suggestion = getRecommendation(category, s, excludeIds, true);

    if (suggestion) {
      const next = [...history, suggestion.item.id].slice(-10);
      shuffleHistoryRef.current[histKey] = next;
    }

    if (day === "today") {
      setToday((prev) => {
        const updated = { ...prev, [category]: suggestion };
        persist(todayStr(), updated, tomorrowRef.current);
        return updated;
      });
    } else {
      setTomorrow((prev) => {
        const updated = { ...prev, [category]: suggestion };
        persist(todayStr(), todayRef.current, updated);
        return updated;
      });
    }

    setShuffling((p) => ({ ...p, [category]: false }));
  }, []);

  const handleRespin = useCallback((day: "today" | "tomorrow") => {
    const setRespinning = day === "today" ? setRespinningToday : setRespinningTomorrow;
    setRespinning(true);

    const otherDay = day === "today" ? tomorrowRef.current : todayRef.current;
    const sameDay = day === "today" ? todayRef.current : tomorrowRef.current;
    const excludeIds = [
      ...Object.values(sameDay).filter(Boolean).map((s) => s!.item.id),
      ...Object.values(otherDay).filter(Boolean).map((s) => s!.item.id),
    ];
    const s = settingsRef.current ?? getSettings();
    const fresh = getRecommendations(s, excludeIds, true);

    if (day === "today") {
      setToday(fresh);
      persist(todayStr(), fresh, tomorrowRef.current);
    } else {
      setTomorrow(fresh);
      persist(todayStr(), todayRef.current, fresh);
    }

    setRespinning(false);
  }, []);

  const categories = settings?.enableSnacks ? SNACK_CATEGORIES : CATEGORIES;
  const todayCooked = categories.filter((c) => {
    const s = today[c];
    return s && cookedIds.includes(s.item.id);
  }).length;

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <h1 className="serif" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, margin: "0 0 6px" }}>
        {getGreeting()}
        <br />
        What&apos;s cooking?
      </h1>
      {settings && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>
          Excluding dishes from the last{" "}
          <strong style={{ color: "var(--text)" }}>{settings.avoidRepeatDays} days</strong>
          {" "}· {settings.recommendationStyle.toLowerCase()}
        </p>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "var(--card)", borderRadius: 16, height: 180, opacity: 0.4 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <DaySection
            day="today" suggestions={today} shuffling={shufflingToday} respinning={respinningToday}
            offsetDays={0} categories={categories} cookedIds={cookedIds} cookedCount={todayCooked}
            showPhotos={settings?.showPhotos ?? true}
            onCooked={(id, type) => handleCooked(id, type)} onUndoCooked={handleUndoCooked}
            onShuffle={handleShuffle} onRespin={handleRespin}
          />
          <DaySection
            day="tomorrow" suggestions={tomorrow} shuffling={shufflingTomorrow} respinning={respinningTomorrow}
            offsetDays={1} categories={categories} cookedIds={cookedIds} cookedCount={0}
            showPhotos={settings?.showPhotos ?? true}
            onCooked={(id, type) => handleCooked(id, type)} onUndoCooked={handleUndoCooked}
            onShuffle={handleShuffle} onRespin={handleRespin}
          />
        </div>
      )}
    </div>
  );
}
