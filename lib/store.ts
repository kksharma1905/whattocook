import type { Category, Difficulty, RecommendationStyle } from "./types";
import { SEED_MEALS } from "./seed-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredMeal {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  cookTime: number;
  difficulty: Difficulty;
  isFavorite: boolean;
  notes: string | null;
  imageUrl: string | null;
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredLog {
  id: string;
  mealItemId: string;
  mealType: Category;
  mealName: string;
  cookedAt: string;
}

export interface StoredShopItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  sourceType: "UPCOMING_MEAL" | "PANTRY";
  sourceMealName: string | null;
  isChecked: boolean;
  createdAt: string;
}

export interface StoredSettings {
  avoidRepeatDays: number;
  recommendationStyle: RecommendationStyle;
  enableSnacks: boolean;
  showPhotos: boolean;
}

export interface Suggestion {
  item: StoredMeal;
  lastCookedAt: string | null;
  daysSinceCooked: number | null;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const K = {
  meals: "wtc:meals",
  logs: "wtc:logs",
  shop: "wtc:shop",
  settings: "wtc:settings",
  seeded: "wtc:seeded_v3",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function initIfEmpty(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K.seeded)) return;
  const ts = now();
  const meals: StoredMeal[] = SEED_MEALS.map((m) => ({
    ...m,
    id: uid(),
    notes: null,
    imageUrl: null,
    ingredients: [],
    isFavorite: false,
    createdAt: ts,
    updatedAt: ts,
  }));
  write(K.meals, meals);
  localStorage.setItem(K.seeded, "1");
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export function getMeals(category?: Category): StoredMeal[] {
  const all = read<StoredMeal[]>(K.meals, []);
  return category ? all.filter((m) => m.category === category) : all;
}

export function getMealsWithHistory(category?: Category): (StoredMeal & { lastCookedAt: string | null; daysSinceCooked: number | null })[] {
  const meals = getMeals(category);
  const lastCookedMap = buildLastCookedMap();
  return meals.map((m) => {
    const lastCookedAt = lastCookedMap.get(m.id) ?? null;
    const daysSinceCooked = lastCookedAt
      ? Math.floor((Date.now() - new Date(lastCookedAt).getTime()) / 86400000)
      : null;
    return { ...m, lastCookedAt, daysSinceCooked };
  });
}

export function addMeal(data: Omit<StoredMeal, "id" | "createdAt" | "updatedAt">): StoredMeal {
  const all = read<StoredMeal[]>(K.meals, []);
  const meal: StoredMeal = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
  write(K.meals, [...all, meal]);
  return meal;
}

export function updateMeal(id: string, data: Partial<Omit<StoredMeal, "id">>): StoredMeal | null {
  const all = read<StoredMeal[]>(K.meals, []);
  let updated: StoredMeal | null = null;
  const next = all.map((m) => {
    if (m.id !== id) return m;
    updated = { ...m, ...data, id, updatedAt: now() };
    return updated;
  });
  write(K.meals, next);
  return updated;
}

export function deleteMeal(id: string): void {
  write(K.meals, read<StoredMeal[]>(K.meals, []).filter((m) => m.id !== id));
}

export function toggleFavorite(id: string): void {
  const all = read<StoredMeal[]>(K.meals, []);
  write(K.meals, all.map((m) => m.id === id ? { ...m, isFavorite: !m.isFavorite, updatedAt: now() } : m));
}

// ─── Cook Logs ────────────────────────────────────────────────────────────────

function buildLastCookedMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const log of read<StoredLog[]>(K.logs, [])) {
    map.set(log.mealItemId, log.cookedAt);
  }
  return map;
}

export function getCookLogs(): StoredLog[] {
  return read<StoredLog[]>(K.logs, []);
}

export function addCookLog(mealItemId: string, mealType: Category): StoredLog {
  const logs = read<StoredLog[]>(K.logs, []);
  const meal = getMeals().find((m) => m.id === mealItemId);
  const log: StoredLog = {
    id: uid(),
    mealItemId,
    mealType,
    mealName: meal?.name ?? "Unknown",
    cookedAt: now(),
  };
  write(K.logs, [...logs, log]);
  return log;
}

export function deleteCookLog(id: string): void {
  write(K.logs, read<StoredLog[]>(K.logs, []).filter((l) => l.id !== id));
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export function getShoppingItems(): StoredShopItem[] {
  return read<StoredShopItem[]>(K.shop, []);
}

export function addShoppingItem(data: Omit<StoredShopItem, "id" | "createdAt">): StoredShopItem {
  const all = read<StoredShopItem[]>(K.shop, []);
  const item: StoredShopItem = { ...data, id: uid(), createdAt: now() };
  write(K.shop, [...all, item]);
  return item;
}

export function updateShoppingItem(id: string, data: Partial<StoredShopItem>): void {
  write(K.shop, read<StoredShopItem[]>(K.shop, []).map((i) => i.id === id ? { ...i, ...data } : i));
}

export function deleteShoppingItem(id: string): void {
  write(K.shop, read<StoredShopItem[]>(K.shop, []).filter((i) => i.id !== id));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: StoredSettings = {
  avoidRepeatDays: 4,
  recommendationStyle: "CONTEXTUAL",
  enableSnacks: false,
  showPhotos: true,
};

export function getSettings(): StoredSettings {
  return read<StoredSettings>(K.settings, DEFAULT_SETTINGS);
}

export function updateSettings(data: Partial<StoredSettings>): StoredSettings {
  const updated = { ...getSettings(), ...data };
  write(K.settings, updated);
  return updated;
}

// ─── Recommendation engine ────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRecommendation(
  category: Category,
  settings: StoredSettings,
  excludeIds: string[] = []
): Suggestion | null {
  const cutoffMs = Date.now() - settings.avoidRepeatDays * 86400000;
  const allMeals = getMeals(category);
  const allLogs = getCookLogs().filter((l) => l.mealType === category);
  const lastCookedMap = buildLastCookedMap();

  const recentIds = new Set([
    ...allLogs.filter((l) => new Date(l.cookedAt).getTime() >= cutoffMs).map((l) => l.mealItemId),
    ...excludeIds,
  ]);

  const fresh = allMeals.filter((m) => !recentIds.has(m.id));
  const stale = allMeals.filter((m) => recentIds.has(m.id) && !excludeIds.includes(m.id));
  const pool = fresh.length > 0 ? fresh : stale;
  if (pool.length === 0) return null;

  let picked: StoredMeal;

  if (settings.recommendationStyle === "RANDOM") {
    picked = shuffle(pool)[0];
  } else if (settings.recommendationStyle === "WEIGHTED") {
    const scored = pool.map((m) => {
      const last = lastCookedMap.get(m.id);
      const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 9999;
      return { meal: m, score: days + (m.isFavorite ? 10 : 0) };
    });
    scored.sort((a, b) => b.score - a.score);
    picked = shuffle(scored.slice(0, Math.max(1, Math.ceil(scored.length / 2))))[0].meal;
  } else {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    const preferEasy = hour < 8 || hour > 21 || !isWeekend;
    const scored = pool.map((m) => {
      const last = lastCookedMap.get(m.id);
      const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 9999;
      let score = days;
      if (preferEasy && m.difficulty === "easy") score += 5;
      if (isWeekend && m.difficulty === "hard") score += 3;
      if (m.isFavorite) score += 2;
      return { meal: m, score };
    });
    scored.sort((a, b) => b.score - a.score);
    picked = shuffle(scored.slice(0, Math.max(1, Math.ceil(scored.length / 3))))[0].meal;
  }

  const lastCookedAt = lastCookedMap.get(picked.id) ?? null;
  const daysSinceCooked = lastCookedAt
    ? Math.floor((Date.now() - new Date(lastCookedAt).getTime()) / 86400000)
    : null;

  return { item: picked, lastCookedAt, daysSinceCooked };
}

export function getRecommendations(
  settings: StoredSettings,
  excludeIds: string[] = []
): Record<Category, Suggestion | null> {
  const categories: Category[] = settings.enableSnacks
    ? ["BREAKFAST", "LUNCH", "SNACK", "DINNER"]
    : ["BREAKFAST", "LUNCH", "DINNER"];
  const result: Record<string, Suggestion | null> = {};
  for (const cat of categories) {
    result[cat] = getRecommendation(cat, settings, excludeIds);
  }
  return result as Record<Category, Suggestion | null>;
}
