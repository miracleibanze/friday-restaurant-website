export const accompanimentTypes = ["chips", "samosa", "pilau"] as const;
export type AccompanimentType = (typeof accompanimentTypes)[number];
export type Accompaniments = Record<AccompanimentType, number>;

export const emptyAccompaniments: Accompaniments = {
  chips: 0,
  samosa: 0,
  pilau: 0,
};

export const maxAccompaniments = 4;

export function accompanimentTotal(value: Partial<Accompaniments> | undefined) {
  return accompanimentTypes.reduce(
    (total, type) => {
      const count = value?.[type];
      return total + (count !== undefined && Number.isInteger(count) ? count : 0);
    },
    0,
  );
}

export function displayFoodName(name: string) {
  return name.startsWith("Friday ") ? name : `Friday ${name}`;
}
