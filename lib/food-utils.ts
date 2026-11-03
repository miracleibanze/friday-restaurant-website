export function displayFoodName(name: string) {
  return name.startsWith("Friday ") ? name : `Friday ${name}`;
}
