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

## Erweiterung: persönlicher Einstieg und Einstellungen

- Direkter DE/EN-Sprachwechsel als verankertes Dropdown, ohne neue Route. Deutsch, English und Gerätesprache sowie Schließen durch Auswahl oder Tippen außerhalb im nativen Simulator geprüft.
- Startknopf im kompakten grünen Café-Kasten sichtbar, vom Nutzer bestätigt. Die Lucía-Karte wurde vom Dashboard entfernt.
- Vierstufiges Onboarding auf Deutsch/Englisch geprüft: Lucías Begrüßung, Sprache, Lernstimme, tägliches Zeitbudget und freiwillige Erinnerung. Einstellungen anschließend über das Zahnrad erreichbar.
- Weibliche Systemstimme Mónica erkannt und Vorschau/Lernphrase ausgelöst. Männliche Stimme im Simulator nicht installiert: Hinweis wird korrekt angezeigt. Die verfügbaren Stimmen Mónica/Paulina werden aus dem Gerät gelesen. Eine hörbare männliche Stimme konnte auf diesem Simulator daher nicht geprüft werden; die Auswahl vorhandener männlicher Stimmen und der Umgang mit unbekannten Stimmen sind automatisiert getestet.
- 5 Minuten als Tagesziel gewählt; Onboarding abgeschlossen; App-Prozess beendet und neu gestartet. Sprache Englisch, Ziel, Stimmwahl, Erinnerungszeit und Onboarding-Abschluss blieben erhalten. Der vorherige vollständige Testlernstand blieb beim Onboarding erhalten.
- Lokale Erinnerung bewusst aktiviert: iOS fragt erst dabei nach Erlaubnis. Testzeit 19:24 gesetzt, Banner um 19:24 im Simulator tatsächlich angezeigt und als Screenshot dokumentiert. Danach wieder deaktiviert; Schalter und gespeicherte Einstellung sind aus. Auf dem persönlichen iPhone bleiben Erinnerungen standardmäßig aus, bis der Nutzer sie selbst aktiviert.
- Für den ersten Lernstart einen frischen Simulator-Teststand eingesetzt, vorherigen Stand gesichert: Spanischer Motivationssatz mit englischer Übersetzung angezeigt; „Los geht’s“ öffnet Phrasenübung 1. Beim erneuten Fortsetzen erscheint kein zweiter Lernmoment am selben Tag. Das Tagesdatum wird gespeichert. Der ursprüngliche Simulator-Lernstand wurde anschließend wiederhergestellt.
- Insgesamt 19 automatisierte Tests bestanden; TypeScript und ESLint ohne Fehler. Hermes-Bundles für beide Plattformen erfolgreich erzeugt. Native iOS-Release-Builds mit Expo Notifications für Simulator und iPhone erfolgreich. Keine Remote-Push-Berechtigung/kein Push-Token konfiguriert.
- Screenshots liegen im übergeordneten Ausgabeordner: Onboarding, Sprachdropdown, Startansicht, Lernmoment und zugestellte Erinnerung.

Android-APK/Geräteprüfung und ein tatsächlicher männlicher Systemsprecher bleiben abhängig von der jeweils verfügbaren Entwicklungsumgebung bzw. installierten Stimme. Das Zeitbudget misst keine tatsächliche Lernzeit und verändert den Umfang des ersten Lerntags nicht.

Der abschließende Release-Build wurde erneut erfolgreich auf dem iPhone installiert. Der automatische Start war anschließend wegen gesperrtem Gerät nicht möglich; die App kann nach dem Entsperren regulär geöffnet werden.

## Korrektur: stumme iPhone-Sprachausgabe

Nach Nutzerrückmeldung „keine Stimmen hörbar“ wurde die bisherige Standard-Audio-Session ersetzt. Vorschau und Lernphrasen verwenden gemeinsam `expo-audio`: `playsInSilentMode: true`, Aufnahme aus, keine Hintergrundwiedergabe, keine Hörerroute; anschließend explizite Aktivierung. `expo-speech` nutzt diese App-Session mit relativer Lautstärke 1 und der gewählten Stimm-ID. Die Geräte-Medienlautstärke und Bluetooth-Route werden nicht überschrieben.

Eine zentrale Steuerung wartet auf Stoppen und Audio-Vorbereitung; neuere Tastendrücke verwerfen überholte wartende Ausgaben. Fehler beim Vorbereiten werden angezeigt. Mikrofonzugriff und Hintergrund-Audiodienste sind im Config-Plugin ausgeschaltet. Generierte iOS-/Android-Konfiguration auf fehlende Mikrofonberechtigung geprüft.

22 automatisierte Tests bestanden. Die drei zusätzlichen Tests prüfen Reihenfolge und Wiedergabeeinstellungen, schnelle erneute Tastendrücke/Abbruch sowie die Fehlerbehandlung mit anschließendem Wiederholungsversuch. TypeScript und ESLint ohne Fehler; native Hermes-Bundles für iOS und Android erfolgreich.

Die vorherigen Prüfungen haben die hörbare Ausgabe auf dem persönlichen iPhone nicht nachgewiesen. Die tatsächliche Hörbarkeit nach dieser Korrektur muss auf dem iPhone mit Medienlautstärke größer null und dem gewünschten Ausgabegerät bestätigt werden. Ein erfolgreicher Sprachausgabe-Aufruf allein beweist keinen hörbaren Ton.

Audio-Korrektur nativ gebaut: Release-Simulator und Release-iPhone erfolgreich. Installation auf dem iPhone zu 100 % bestätigt; Start wegen Gerätesperre nicht möglich. Im neuen Simulator-Build Stimmvorschau Mónica ausgelöst, ohne angezeigten Laufzeitfehler. Hörbarkeit auf dem persönlichen iPhone weiterhin vom Nutzer zu bestätigen.

## Vorbereitung fester Audios (noch keine neue Klangqualität ausgeliefert)

- Nutzer hat die hörbare iPhone-Sprachausgabe nach der Audio-Session-Korrektur bestätigt.
- Genau zwei feste Stimmen vorbereitet: weiblich/männlich, jeweils natürliche und separate langsame Fassung. Katalog mit 17 Texten deckt alle derzeit hörbaren Phrasen, Dialogfragen, Hinweise, Vokabeln und den Vorschausatz ab. 68 Dateien geplant.
- Tests prüfen vollständige Katalogabdeckung sowie Ausschluss unvollständiger Pakete. 24 automatisierte Tests, TypeScript und ESLint erfolgreich.
- Dateiwiedergabe nutzt das vorhandene Expo-Audio-Modul. Tatsächliche feste Audios fehlen; `recordingPackReady` bleibt false. Kein Wechsel der Stimme und keine Aktivierung der neuen Auswahl ohne vollständigen Satz.
- Keine MP3-Dateien erzeugt und keine Hörqualität freigegeben. Ein nativer Wiedergabetest der festen Aufnahmen ist deshalb noch nicht möglich. Auf dem persönlichen iPhone wurde in diesem Schritt keine neue Version installiert.
- Fal-Anmeldung im Browser vorhanden, aber Kontoverbindung steht noch aus. Fal verlangt unter „Finish setup“ Rechnungsadresse, Karte und Guthaben. Es wurden keine Zahlungsdaten eingetragen, keine Guthabenkäufe und keine kostenpflichtigen Generierungen ausgelöst.

## Sieben Lerntage und Store-Vorbereitung · 9. November 2026

Sieben vollständige bilinguale Lektionen, separater Fortschritt und Migration bestehender Tag-1-Daten implementiert. Alle 27 Tests bestanden, TypeScript/ESLint und iOS-/Android-Hermes-Bundles erfolgreich. iOS-Release-Simulator-Build erfolgreich. Alte Tag-1-Daten (100 %) blieben erhalten; Tag 2 in Englisch vollständig aufgebaut, Dialog beantwortet und Karten abgeschlossen. Sprachwechsel auf Deutsch erhält den Abschluss; Tag 3 beginnt bei 0 %. Nach Prozessneustart bleiben Tag 1 und 2 abgeschlossen, Tag 3 ausgewählt und Einstellungen erhalten. iPad-Pro-13-Onboarding, sofortiger Sprachwechsel und Startansichten geprüft.

11 echte native Store-Bilder in passenden iPhone-/iPad-Größen vorbereitet. Quellcode und 14 iOS-Bundle-Datenschutzmanifeste geprüft; keine Tracking-/Erhebungsdeklaration und keine Mikrofon-/Kameraberechtigung vorhanden. Grenzen: kein Netzwerkverkehrsnachweis, kein signiertes Store-Archiv. Zwei finale englische Rechtsbereich-Beschriftungen und die erweiterte zukünftige Audio-Liste wurden nach dem nativen Build ergänzt; endgültige Quell-Bundles sind geprüft.

Neuer iPhone-Build nicht installiert: physisches Gerät war nicht erreichbar. Android-SDK fehlt; keine APK-/AAB-, Geräte- oder Screenshotprüfung. Store-Release nicht freigegeben. `release/README.md` und `release/release-status.json` dokumentieren juristische Prüfung, Hosting-URLs, Konto-/Signierung, Fragebögen und Distributionstests. Aktueller Audio-Katalog: 94 Texte, geplant 376 Dateien; keine Aufnahmen vorhanden oder aktiviert.

## Aktualisierung: persönliches iPhone verbunden · 9. November 2026

Aktuellen finalen Quellstand mit sieben Tagen, neuen Rechtsangaben und vollständiger englischer Beschriftung als iOS-Release für das iPhone 13 gebaut: erfolgreich, null Fehler und drei Build-Warnungen. Installation zu 100 % abgeschlossen. Anschließender Start durch Apples Gerätewerkzeug erfolgreich bestätigt. Es wurde kein Lernstand gelöscht. TypeScript und ESLint erneut bestanden. Dies bestätigt Installation und Prozessstart; es ersetzt keine abschließende Nutzerprüfung der neuen Lektionen auf dem Gerät und keine Store-Distributionstests.

## Hören/Sprechen und Wochenvokabeln · Build 3 · 9. November 2026

31 Tests bestanden; TypeScript/ESLint und Hermes-Exporte für beide Plattformen erfolgreich. Native Spracherkennung 58.0.1 eingebunden. Mikrofon in generierter Android-/iOS-Konfiguration sowie tatsächlichem iPhone-Bundle vorhanden. On-device-only-Option, keine persistierte Tondatei; iOS-Fallbackschutz reproduzierbar per postinstall gesetzt.

Native iPhone-/Simulator-Release-Builds erfolgreich. iPhone installiert und Prozessstart bestätigt. Abschließende UI-Korrekturen (bekannte Karten weiterblättern, tatsächliches Schreibfeld, Mikrofonabbruch beim Öffnen der Dialoghilfe) per Expo export:embed als Hermes-Bundle in App-Kopien eingebettet; vorhandene Gerätesignatur beibehalten, strikte Signaturprüfungen erfolgreich, finale Installation bestätigt. Letzter Start durch Gerätesperre blockiert.

Simulator: Vorlesen beim Eintritt, Freigabe des Nachsprechknopfs nach Vorlese-Ende, Mikrofonabfrage erst nach Tippen, Ablehnung zeigt Hinweis/Schreibalternative. Vorhandene abgeschlossene Tage 1/2 erhalten; Wochensammlung zeigt sechs Wörter. Tages-/Wochenwechsel und freiwillige Karten/Bedeutung angezeigt, echtes optionales Texteingabefeld bestätigt. Automatisierte Tests prüfen 20 eindeutige Wochenwörter, Zurückstellen/Neustart und Freigabe erst nach vollständiger Woche/Vokabeln. Keine echte spanische Sprachaufnahme als Hardwaretest durchgeführt; keine Aussprachequalität behauptet. Android-Hardwaretests weiterhin offen.
