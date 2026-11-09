// Duolingo-like progression: a day opens once the previous day's dialogue is done.
export function dayUnlocked(id: number, completed: (id: number) => boolean) {
  return id === 1 || completed(id - 1);
}
