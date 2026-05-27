export type Category = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
export type Difficulty = "easy" | "medium" | "hard";
export type RecommendationStyle = "CONTEXTUAL" | "WEIGHTED" | "RANDOM";

export interface MealItem {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  cookTime: number;
  difficulty: Difficulty;
  isFavorite: boolean;
  notes?: string | null;
  imageUrl?: string | null;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
  lastCookedAt?: Date | null;
  daysSinceCooked?: number | null;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface CookLog {
  id: string;
  mealItemId: string;
  mealType: Category;
  cookedAt: Date;
  mealItem?: MealItem;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  sourceType: "UPCOMING_MEAL" | "PANTRY";
  sourceMealName?: string | null;
  isChecked: boolean;
  createdAt: Date;
}

export interface Settings {
  id: number;
  avoidRepeatDays: number;
  recommendationStyle: RecommendationStyle;
  enableSnacks: boolean;
  showPhotos: boolean;
}

export interface Suggestion {
  item: MealItem;
  lastCookedAt: Date | null;
  daysSinceCooked: number | null;
}
