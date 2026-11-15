import type { Day } from "./types.ts";
// Freemium rule: the first week is free, everything after needs Premium.
export const FREE_WEEKS = 1;
export const ENTITLEMENT = "premium";
export const needsPremium = (day: Pick<Day, "week">) => day.week > FREE_WEEKS;
