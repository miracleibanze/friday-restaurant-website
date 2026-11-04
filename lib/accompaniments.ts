import type { Food } from "@/lib/menu-data";

export const accompanimentTypes = ["chips", "sambusa", "pilau"] as const;
export type AccompanimentType = (typeof accompanimentTypes)[number];
export type Accompaniments = Record<AccompanimentType, number>;

export const emptyAccompaniments: Accompaniments = {
  chips: 0,
  sambusa: 0,
  pilau: 0,
};

export function accompanimentTotal(value?: Partial<Accompaniments>) {
  return accompanimentTypes.reduce(
    (total, type) => {
      const count = value?.[type];
      return total + (count !== undefined && Number.isInteger(count) ? count : 0);
    },
    0,
  );
}

export function isAccompaniments(value: unknown): value is Accompaniments {
  if (!value || typeof value !== "object") return false;
  const sides = value as Partial<Record<AccompanimentType, unknown>>;
  return (
    accompanimentTypes.every(
      (type) =>
        Number.isInteger(sides[type]) &&
        Number(sides[type]) >= 0 &&
        Number(sides[type]) <= 4,
    ) && accompanimentTotal(sides as Partial<Accompaniments>) <= 4
  );
}

export function isFullChicken(food: Pick<Food, "name" | "slug">) {
  const searchableName = `${food.name} ${food.slug}`.toLowerCase();
  return searchableName.includes("full-chicken") ||
    searchableName.includes("full chicken") ||
    searchableName.includes("whole-chicken") ||
    searchableName.includes("whole chicken");
}

export function accompanimentLabel(value?: Partial<Accompaniments>) {
  return accompanimentTypes
    .filter((type) => (value?.[type] ?? 0) > 0)
    .map((type) => `${value?.[type] ?? 0} ${type}`)
    .join(", ");
}

export function accompanimentKey(value?: Partial<Accompaniments>) {
  return accompanimentTypes.map((type) => value?.[type] ?? 0).join("-");
}
