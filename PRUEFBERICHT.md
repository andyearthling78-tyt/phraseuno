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

## Berichtigung · 9. November 2026

Überholt: „Letzter Start durch Gerätesperre blockiert“. Nach dem Entsperren wurde der Start der aktuell installierten Build-3-Version per `devicectl` erfolgreich bestätigt. Ebenfalls überholt ist die frühere Zusammenfassung „keine Mikrofonberechtigung“: Build 3 fragt absichtlich nach Mikrofonzugriff für die On-device-Spracherkennung; maßgeblich sind `app.json` und `release/ios-privacy-audit.json`. Eine reale spanische Spracherkennung auf dem iPhone ist weiterhin nicht nachgewiesen.

## Stimmen, Phrasenablauf und Wochenabfrage · Build 4 (Quellstand) · 9. November 2026

Nutzerfeedback: Lucía klang männlich. iOS liefert das Stimmgeschlecht jetzt nativ (`scripts/patch-speech-voice-gender.mjs`, per postinstall, idempotent, bricht bei unbekanntem Quellstand ab). Lucía = weibliche, Mateo = männliche Stimme; natürliche es-ES-/Enhanced-Stimmen vor Eloquence-Stimmen. Erfordert einen neuen nativen Build.

Jede Phrase folgt jetzt fest: Hören (Text verborgen) → Nachsprechen (überspringbar, wenn Sprechen nicht möglich) → Lesen (neuer Baustein hervorgehoben, Tipp) → Schreiben (Pflicht vor dem nächsten Baustein). Danach Dialog, am Tagesende Vokabelabfrage.

Wochenabfrage: Nach allen sieben Lerntagen öffnet sich im Vokabel-Reiter die Abfrage aller 20 Wochenwörter; unsichere Wörter wiederholen sich am Ende. `readyForNextWeek` verlangt jetzt zusätzlich den abgeschlossenen Wochencheck (`weekReviewedAt`, verlustfrei ergänzt, Speicher-Version unverändert).

33 Tests, TypeScript und ESLint bestanden. Noch nicht nativ gebaut oder auf dem iPhone geprüft.

## Sprechen stabilisiert, Mikrofonanzeige, ruhigere Lernseiten · 9. November 2026

iPhone-Feedback zu Build 4: „Antwort sprechen“ reagierte oft nicht, Lucías nächste Frage brach mittendrin ab, Antworten wurden nach dem ersten Wort beendet, Seiten zu textlastig.

Ursachen/Behebung: Abbrechen einer gar nicht laufenden Erkennung setzte die geteilte Audiositzung zurück (jetzt nur eigene Erkennung abbrechen); Kategorie-Wechsel zwischen Sprachausgabe (playback) und Mikrofon (playAndRecord/measurement) – jetzt eine gemeinsame playAndRecord-Sitzung; Sprachausgabe wartet app-weit auf das Ende der Erkennung plus 350 ms; Erkennung kontinuierlich mit eigener Pausenerkennung (1,7 s); unbeabsichtigte Abbrüche zeigen einen Hinweis statt nichts. Großes Mikrofon: grün = bereit, rot pulsierend mit Pegel = jetzt sprechen. Dialog zeigt nur noch aktuelle Frage und letzte Rückmeldung; Nebenaktionen als kleine Knöpfe; Datenschutz-Fußnoten aus den Übungen entfernt (bleiben unter Info/Datenschutz). Hinweis auf kostenlose erweiterte iOS-Stimmen in den Stimmeinstellungen.

35 Tests, TypeScript, ESLint bestanden. Nativer Build und Gerätetest stehen aus.

## Ruhigeres Layout und 🐇/🐌-Tempo · 9. November 2026

Startseite: ein grüner Tageskasten mit Zielsatz, drei Schritt-Chips und Startknopf; Woche als Leiste mit sieben Tagen statt sieben Knöpfen; Erklärtexte und 80/20-Karte entfernt. Während der Lektion kein App-Kopf mehr (nur Zurück + Fortschritt). Vokabelseite und Tagesabschluss gekürzt. Tempo-Schalter 🐇 normal / 🐌 langsam direkt in jeder Hör-/Sprechübung (Sprechrate 0,9 bzw. 0,55); Umschalten spielt den Satz sofort neu ab und wird gespeichert. 36 Tests, TypeScript, ESLint bestanden; JS-Bundle (1283 Module) erzeugt. Gerätetest ausstehend.

## Erfolgsmomente, Antwort-Bausteine, Knopfleiste · 9. November 2026

Gerätefeedback: Knopfbeschriftungen umbrachen, nach richtiger Sprachantwort kam keine sichtbare Bestätigung, unklar was zu antworten ist. Jetzt: Erfolgskarte (✓-Animation, „¡Muy bien!“, Weiter-Knopf) nach richtigem Nachsprechen, Schreiben und jeder Dialogantwort; der Dialog geht erst nach „Nächste Frage →“ weiter. Unter jeder Frage stehen die Wörter der Musterantwort als ungeordnete Bausteine. Nebenknöpfe als Symbol mit einzeiliger Kurzbeschriftung. Tag 1, Frage 3 akzeptiert auch „para tomar aquí“. 36 Tests, TypeScript, ESLint bestanden.

## Toleranz bei der Spracherkennung · 9. November 2026

Gerätefeedback: „para llevar“ wurde nicht erkannt. Jetzt: Erkennung erhält erwartete Sätze/Wörter als Kontext (iOS contextualStrings), bis zu drei Alternativen werden geprüft, und erkannte Wörter werden nach Klang (ll/y, v/b, z/c/s, stummes h) bzw. mit einem Buchstaben Toleranz bei Wörtern ab vier Buchstaben auf die Lektionswörter abgebildet. Widersprüche („sin leche“, „no quiero“) bleiben falsch. 37 Tests bestanden.

## Duolingo-ähnlicher Aufbau · 9. November 2026

Nutzerentscheidung: Lernpfad, Tages-Serie und Punkte (keine Herzen); falsche Antworten kommen am Lektionsende erneut.

- Startseite = Lernpfad: Woche als Abschnitt, sieben Stationen im Zickzack, nächste Station gelb mit hüpfender START/WEITER-Blase, erledigte Stationen grün ✓, Wochenabfrage als Truhe 🔒/🎁/🏆. Oben 🔥 Serie und ⚡ Wochenpunkte.
- Lerntag = 20 kurze Übungen (16 Phrasen/Dialog = 80 %, 4 Wörter = 20 %): je Baustein Hören+Nachsprechen → Satz aus Wortkacheln bauen → Schreiben; nach Baustein 2 Wortpaare zuordnen; vier Dialogfragen (sprechen oder tippen, Wortbausteine als Stütze); am Ende Vokabelabfrage (Bedeutung wählen).
- Unten „Prüfen“, danach grüne (¡Muy bien!) oder rötliche Leiste mit richtiger Lösung; falsche Übungen werden hinten angehängt. „Später“ schaltet Sprechübungen für die Sitzung ab (Dialog dann per Tastatur).
- Abschluss: Pokal, Punkte (10, +5 ohne Fehler), Genauigkeit, Serie.
- Fortschritt bleibt im bestehenden Speicherformat (LearningState v1): Bausteine/Dialog/Wörter werden nach jeder bestandenen Übung gespeichert; unterbrochene Tage setzen an der richtigen Stelle fort. Serie/Punkte unter eigenem Schlüssel `phraseuno.stats.v1`, wird mit „Lernstand löschen“ entfernt.

40 Tests, TypeScript, ESLint bestanden; JS-Bundle exportiert. Nativer Build/Gerätetest ausstehend.

## Korrektur: PhraseUNO-Optik, Duolingo-Aufbau · 9. November 2026

Nutzerklarstellung: übernommen werden sollen Fortschritt und Lektionsaufbau, nicht die Optik. Zickzack-Pfad, Truhe, hüpfende Blase, 3D-Kacheln, gelbe Lautsprecher und farbige Ergebnisleisten zurückgebaut. Startseite wieder im PhraseUNO-Stil: grüner Kasten mit dem nächsten Tag und Zielsatz, darunter Woche 1 als ruhige Liste. Neu: Tage werden nacheinander freigeschaltet (🔒 bis der Vortag geschafft ist), Wochenabfrage danach. Übungsfolge, Wiederholung falscher Übungen, Serie und Punkte bleiben. 41 Tests, TypeScript, ESLint, JS-Bundle bestanden.

## Kein automatisches Vorlesen · 9. November 2026

Nutzerwunsch: Sätze und Fragen werden nur noch auf Knopfdruck (♪ Hören / ♪-Knopf) abgespielt, nirgends automatisch beim Öffnen einer Übung. Tempowechsel 🐇/🐌 spielt als bewusste Aktion weiterhin neu ab. 41 Tests, TypeScript, ESLint bestanden.
