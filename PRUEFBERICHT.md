# PhraseUNO Native – Prüfstand

8. November 2026

## Erfolgreich

- React-Native-/Expo-Projekt ausschließlich für iOS und Android konfiguriert.
- Xcode-Debug-Build für den iPhone-17-Pro-Max-Simulator: erfolgreich, null Buildfehler.
- Kompletter Tag 1 in der nativen iOS-App: vier Phrasen per Wortauswahl, falsche Dialogantwort mit gezielter Korrektur, vier erfolgreiche Café-Dialogantworten.
- Karten umgedreht, „el café“ zunächst zur Wiederholung zurückgestellt, „la leche“ und „llevar“ bestätigt, „el café“ erneut angezeigt und bestätigt.
- Tagesabschluss mit 100 % erreicht. Native App über „Reload“ vollständig neu geladen: Lernstand bleibt mit 4/4 Phrasen, 4/4 Dialogantworten und 3/3 Wörtern erhalten.
- Native Navigation zu Fortschritt und Wörtersammlung geprüft.
- Sechs automatisierte Tests bestanden, einschließlich Akzentnormalisierung, falscher und widersprüchlicher Antworten und defekter/inkonsistenter Speicherdaten.
- TypeScript und ESLint ohne Fehler abgeschlossen.
- Finale Hermes-Bundles für iOS und Android erfolgreich erzeugt.
- Expo-Kompatibilitätsprüfung meldet passende Abhängigkeiten; diese Prüfung lief offline.

- Release-Build für das angeschlossene iPhone 13 erfolgreich (null Buildfehler). Installation auf dem Gerät bestätigt: Complete 100 %. Der Build enthält das Lernbundle und braucht keinen Entwicklungsserver.
- Start der installierten App auf dem verbundenen iPhone per Xcode-Gerätewerkzeug erfolgreich bestätigt. Der komplette interaktive Lerntag wurde im Simulator geprüft.

## Grenzen

- Android-Gerätetest und APK-Kompilierung nicht ausgeführt: Auf diesem Mac ist kein Android SDK installiert.
- Sprachausgabe ist integriert, die hörbare Wiedergabe wurde nicht separat geprüft. Keine eigene Spracherkennung; Antworten per Tastatur, optional mit Systemdiktat.
- Der Lehrer ist eine offen gekennzeichnete lokale Simulation. Keine KI-API, kein Nutzerkonto, keine Cloud-Synchronisierung.
