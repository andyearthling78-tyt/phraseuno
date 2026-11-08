import english from "./locales/en.json" with { type: "json" };
export type Language = "de" | "en";
export type LanguagePreference = Language | "system";
export const LANGUAGE_KEY = "phraseuno.language.v1";
export function restorePreference(raw: string | null): LanguagePreference {
  return raw === "de" || raw === "en" ? raw : "system";
}
export function resolveLanguage(
  preference: LanguagePreference,
  tags: readonly string[],
): Language {
  if (preference !== "system") return preference;
  for (const tag of tags) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (base === "de" || base === "en") return base;
  }
  return "en";
}
const catalog: Record<string, string> = english;
export function translate(text: string, language: Language): string {
  if (language === "de" || !text.trim()) return text;
  const leading = text.match(/^\s*/)?.[0] ?? "",
    trailing = text.match(/\s*$/)?.[0] ?? "";
  const normalized = text.trim().replace(/\s+/g, " ");
  if (catalog[normalized]) return leading + catalog[normalized] + trailing;
  // Stored teacher feedback stays in the original data language and is translated for display.
  if (normalized.startsWith("¡Muy bien! "))
    return (
      leading +
      "¡Muy bien! " +
      translate(normalized.slice(11), language) +
      trailing
    );
  if (text.includes("\n"))
    return text
      .split("\n")
      .map((line) => translate(line, language))
      .join("\n");
  const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^(.*) auf Spanisch anhören$/, (m) => `Listen to ${m[1]} in Spanish`],
    [/^(.*) zurücklegen$/, (m) => `Put ${m[1]} back`],
    [
      /^Karte umdrehen: (.*)$/,
      (m) => `Flip card: ${translate(m[1], language)}`,
    ],
    [/^Kontakt: (.*)$/, (m) => `Contact: ${m[1]}`],
  ];
  for (const [pattern, format] of patterns) {
    const match = normalized.match(pattern);
    if (match) return leading + format(match) + trailing;
  }
  return text;
}
