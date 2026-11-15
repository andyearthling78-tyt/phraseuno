# PhraseUNO

Sprachen lernen mit ganzen Sätzen: 80 % Phrasen, 20 % Wörter. Native App für iOS und Android (Expo SDK 58, React Native, TypeScript). Start mit Spanisch; weitere Sprachen brauchen nur neue Inhalte.

## Lernprinzip
| Prinzip | Umsetzung | Quelle |
|---|---|---|
| Ganze Wendungen (Chunks) | Jeder Satz wächst in vier Schritten | Lewis 1993; Wray 2002 |
| Abrufen statt Nachlesen | Jede Übung fragt ab; falsche Antworten kommen am Ende erneut | Roediger & Karpicke 2006 |
| Verteiltes Wiederholen | Tägliche Wiederholung mit wachsenden Abständen (1, 3, 7, 14, 30, 60 Tage) | Cepeda et al. 2006 |
| Lautes Sprechen | Hören → Nachsprechen → Lesen → Schreiben → Dialog | MacLeod et al. 2010 |

Ein Lerntag hat 20 kurze Übungen: 16 mit Phrasen und Dialog, 4 mit Wörtern. Nach sieben Tagen folgt die Wochenabfrage aller Wörter; erst danach öffnet die nächste Woche.

## Freemium
Woche 1 ist kostenlos, alle weiteren Wochen gehören zu Premium (Monatsabo, Jahresabo, Einmalkauf). Käufe laufen über RevenueCat. Die Regel steht in `src/domain/access.ts`, die Anbindung in `src/services/purchases.ts`. Ohne API-Schlüssel läuft die App im Gratis-Modus.

## Aufbau
- `src/domain` – Lernkern ohne React: Textvergleich, Wiederholungsplan, Übungsfolgen, Fortschritt, Freischaltung
- `src/content` – Kursinhalte (`es/week1.ts`, `es/week2.ts`), Rechtstexte, Anbieterangaben
- `src/services` – Sprachausgabe, Spracherkennung (nur auf dem Gerät), Käufe, Erinnerung
- `src/lesson`, `src/ui`, `src/app` – Übungen, Bausteine der Oberfläche, Bildschirme
- `tests` – `npm test`

## Befehle
```sh
npm install            # wendet auch die beiden iOS-Patches an
npm test && npm run typecheck && npm run lint
npx expo run:android   # lokaler Android-Build (Android Studio nötig)
npx expo run:ios       # lokaler iOS-Build (Mac mit Xcode nötig)
npx eas-cli build --platform all --profile production   # Store-Builds in der Cloud
node scripts/check-release.mjs   # offene Punkte vor der Einreichung
```

## Vor der Veröffentlichung
`node scripts/check-release.mjs` nennt die offenen Punkte. Dazu kommen: Store-Konten, Produkte in App Store Connect und Google Play anlegen und in RevenueCat als Angebot mit dem Anspruch `premium` verbinden, Datenschutz- und Support-URL, aktuelle Screenshots, Tests auf echten Geräten.
