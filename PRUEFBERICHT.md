# PhraseUNO Native – Prüfstand

8. November 2026

## Erfolgreich

- React-Native-/Expo-Projekt ausschließlich für iOS und Android konfiguriert.
- Ursprünglicher Xcode-Debug-Build für den iPhone-17-Pro-Max-Simulator erfolgreich. Nach Ergänzung der Lokalisierung wurde die finale Version als Release-Build auf iPhone 17 (arm64-Simulator) geprüft.
- Kompletter Tag 1 in der nativen iOS-App: vier Phrasen per Wortauswahl, falsche Dialogantwort mit gezielter Korrektur, vier erfolgreiche Café-Dialogantworten.
- Karten umgedreht, „el café“ zunächst zur Wiederholung zurückgestellt, „la leche“ und „llevar“ bestätigt, „el café“ erneut angezeigt und bestätigt.
- Tagesabschluss mit 100 % erreicht. Native App über „Reload“ vollständig neu geladen: Lernstand bleibt mit 4/4 Phrasen, 4/4 Dialogantworten und 3/3 Wörtern erhalten.
- Native Navigation zu Fortschritt und Wörtersammlung geprüft.
- 13 automatisierte Tests bestanden, einschließlich Akzentnormalisierung, falscher und widersprüchlicher Antworten und defekter/inkonsistenter Speicherdaten.
- TypeScript und ESLint ohne Fehler abgeschlossen.
- Finale Hermes-Bundles für iOS und Android erfolgreich erzeugt.
- Expo-Kompatibilitätsprüfung meldet passende Abhängigkeiten; diese Prüfung lief offline.

- Release-Build für das angeschlossene iPhone 13 erfolgreich (null Buildfehler). Installation auf dem Gerät bestätigt: Complete 100 %. Der Build enthält das Lernbundle und braucht keinen Entwicklungsserver.
- Start der installierten App auf dem verbundenen iPhone per Xcode-Gerätewerkzeug erfolgreich bestätigt. Der komplette interaktive Lerntag wurde im Simulator geprüft.

- Aktualisierter zweisprachiger Release-Build auf dem angeschlossenen iPhone 13: erfolgreich mit null Fehlern, Installation zu 100 % bestätigt.

## Deutsch und Englisch

- Vollständiger englischer Lerntag im nativen iPhone-17-Release-Simulator: vier Phrasen, gezielte Dialogkorrektur, vier richtige Dialogantworten, drei umgedrehte und bestätigte Karten, Abschluss mit 100 %.
- Wechsel Englisch → Deutsch → Englisch ohne Verlust des Lernstands. Prozess beendet und neu gestartet: Englisch und 100 % bleiben gespeichert.
- Englische Anbieterinformationen mit unveränderten Kontaktdaten geprüft. US-/UK-Spracherkennung, Rückfall auf Englisch und gespeicherte Einstellungen automatisiert geprüft.
- Zusätzliche Tests decken Unterrichts-/Rechtstexte, spanische Zielphrasen und bereits gespeicherte deutsche Lehrerrückmeldungen ab.

## Grenzen

- Android-Gerätetest und APK-Kompilierung nicht ausgeführt: Auf diesem Mac ist kein Android SDK installiert.
- Sprachausgabe ist integriert, die hörbare Wiedergabe wurde nicht separat geprüft. Keine eigene Spracherkennung; Antworten per Tastatur, optional mit Systemdiktat.
- Der Lehrer ist eine offen gekennzeichnete lokale Simulation. Keine KI-API, kein Nutzerkonto, keine Cloud-Synchronisierung.

- Der erneute lokale Debug-Simulator-Build scheiterte beim Verknüpfen von Expo Dev Launcher (RCTReconnectingWebSocket). Der geprüfte Release-Build läuft eigenständig; der Debug-Entwicklungsworkflow bleibt auf diesem Mac zu klären.
