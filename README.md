# PhraseUNO – native iOS- und Android-App

React Native und Expo SDK 58 mit nativen Oberflächen. Die App benötigt keinen Browser und keinen KI-API-Schlüssel.

## Auf diesem Mac starten

Auf diesem Mac wurde PhraseUNO bereits als eigenständig lauffähige Release-App auf dem verbundenen iPhone installiert und gestartet. Die Abhängigkeiten und das iOS-Projekt sind vorbereitet. Im Projektordner:

```sh
npm run ios
```

Das erstellt und startet eine Entwicklungs-App im iPhone-Simulator einschließlich Entwicklungsserver. Beim zuletzt geprüften Debug-Build trat auf diesem Mac ein Expo-Dev-Launcher-Linkerfehler auf; der eigenständig lauffähige Release-Build wurde erfolgreich geprüft. Details stehen in `PRUEFBERICHT.md`.

### Auf dem verbundenen iPhone

```sh
npm run ios -- --device
```

iPhone als Ziel auswählen. Xcode verwendet dein eingerichtetes Entwicklungsteam zum Signieren. Falls das Gerät gesperrt ist, entsperren; falls iOS den Entwicklermodus oder das Vertrauen in den Entwickler verlangt, diese Freigabe selbst auf dem Gerät durchführen.

### Eigenständig lauffähiger iOS-Build

```sh
npm run ios -- --device --configuration Release
```

Dieser Build enthält den Lerninhalt und braucht keinen laufenden Entwicklungsserver. Für die Installation sind ein passendes Apple-Entwicklungszertifikat und ein Provisioning-Profil nötig. Ein persönliches Entwicklungsteam kann zeitlich begrenzte Geräteinstallationen erlauben. App Store oder TestFlight sind separate Veröffentlichungsschritte.

### Xcode

Nach dem ersten iOS-Build `ios/PhraseUNO.xcworkspace` öffnen. Scheme „PhraseUNO“ wählen, dein iPhone als Ziel setzen und starten. Für Debug-Builds zusätzlich `npm start` im Projektordner ausführen.

## Android

Mit installiertem Android SDK, Java und einem Emulator oder angeschlossenem Android-Gerät:

```sh
npm run android
```

Das Android-Projekt wird von Expo generiert. Native Android-Bundles wurden geprüft; ein APK-Build und Android-Gerätetest sind mangels installiertem Android SDK auf diesem Mac noch nicht ausgeführt. Für einen internen APK-Build mit Expo Build ist in `eas.json` das Profil `preview` vorbereitet. Dieser Cloud-Build benötigt eine Anmeldung und wurde nicht beauftragt oder gestartet.

## Nach dem Entpacken auf einem anderen Rechner

Node.js 24+, npm, für iOS Xcode/CocoaPods, für Android Java/Android SDK installieren. Dann `npm ci` und den passenden Plattformbefehl ausführen. Die nativen Ordner werden aus `app.json` generiert. Keine Zugangsdaten oder Signierzertifikate sind im Quellcodepaket enthalten.

## Funktionsumfang

- Tag 1 im Café: Quiero un café → con leche → por favor → para llevar.
- Vierstufiger simulierter Lehrerdialog mit inhaltsbezogener Antwortprüfung, Rückmeldung und Hilfen.
- Spanische Sprachausgabe mit der Stimme des Geräts. Die App konfiguriert eine aktive Audio-Session für Medienwiedergabe auch im Lautlosmodus. Die Medienlautstärke und die gewählte Audioausgabe bleiben in der Kontrolle des Geräts. Antworten werden schriftlich eingegeben; die Diktierfunktion der Systemtastatur kann verwendet werden. Keine eigene Mikrofonaufnahme und keine Aussprachebewertung.
- Animierte, barrierearm bedienbare Vokabelkarten mit Rückseite und Wiederholungsrunde für unsichere Wörter.
- Ca. acht Minuten Phrasen/Dialog und zwei Minuten Wörter als 80/20-Lernstruktur.
- Tagesabschluss und geordnete, automatische Gerätespeicherung via AsyncStorage. Keine Cloud-Synchronisierung.
- Creme, Dunkelgrün und gelbe Akzente; Native-Stack-Navigation, sichere Bildschirmränder, Tastaturausgleich und Rücksicht auf reduzierte Animationen.

## Prüfungen

```sh
npm run typecheck
npm run lint
npm test
npm run bundle:check
```

Die Bundle-Prüfung erzeugt native Hermes-Bundles für iOS und Android. Sie ersetzt keinen Test auf einem Android-Gerät. Tag 1 ist der komplette Inhalt dieses Prototyps.

Dokumentation: https://docs.expo.dev/versions/v58.0.0/ und https://docs.expo.dev/guides/local-app-development/

## Rechtliches

Das Info-Symbol in der Kopfzeile öffnet den eingebauten Rechtsbereich. Die Anbieterangaben sind im Impressum und in den Datenschutzhinweisen hinterlegt. Die rechtliche Einordnung der Datenverarbeitung ist vor einer Veröffentlichung noch zu vervollständigen. Details und Quellen stehen in `RECHTLICHES.md`. Der Lizenzkatalog ist lokal enthalten; bei aktualisierten Abhängigkeiten mit `python3 scripts/generate-notices.py` aus den installierten npm-Paketen und iOS-Pods neu erzeugen.

## English interface

PhraseUNO now supports German and English, including English-language explanations for the Spanish lesson. On first launch it follows the device language: English is used for US/UK English and as the fallback for unsupported languages. Use the DE/EN control in the app header to choose German, English or the device language. The preference is saved separately from learning progress, so switching languages keeps your progress and deleting learning data preserves the language preference. The target course remains Spanish.

The English privacy and provider information describes the same German-based provider and current prototype. Translating this information does not change its legal meaning or resolve the previously documented legal-basis review.

## GitHub and development on another computer

Repository: https://github.com/andyearthling78-tyt/phraseuno (private).

```sh
git clone https://github.com/andyearthling78-tyt/phraseuno.git
cd phraseuno
npm ci
```

Use Node.js 24 or newer. On macOS with Xcode and CocoaPods: `npm run ios`. On Windows, Linux or macOS with Java and the Android SDK: `npm run android`. Native platform folders are generated from `app.json`; they are intentionally not committed. Application code, assets, translations, tests, dependency lockfile, legal information and build profiles are tracked together for both platforms.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run bundle:check`. The bundle check writes to the ignored `.expo/bundle-check` folder inside the checkout. No signing keys, device data, installed dependencies or machine-specific Xcode settings are stored in GitHub.

## Onboarding, Einstellungen und Lernmomente

Beim ersten Start stellt sich Lucía im vierstufigen Onboarding vor. Dort werden App-Sprache, spanische Lernstimme, tägliches Zeitbudget (5/10/15 Minuten) und eine freiwillige Erinnerung eingestellt. Später öffnet das Zahnrad diese Einstellungen. Der Sprachwechsel bleibt zusätzlich direkt im Dropdown der Kopfzeile möglich. Der Startknopf sitzt im kompakten grünen Café-Kasten; Lucías Vorstellung wird auf dem Dashboard nicht wiederholt.

Die Stimmen werden vom Gerät abgefragt. Bekannte spanische Systemstimmen werden nach Stimmnamen männlich/weiblich zugeordnet. Expo liefert kein allgemeines Geschlechtsfeld. Unbekannte Stimmen können probegehört und manuell zugeordnet werden; wenn eine gewünschte Stimme fehlt, wird keine andere als Ersatz ausgegeben. Spanische Stimmen lassen sich gegebenenfalls in den Spracheinstellungen des Betriebssystems nachladen. Das gilt insbesondere für männliche Stimmen auf Geräten mit wenigen vorinstallierten Stimmen.

Das Tagesziel ist ein persönliches Zeitbudget, kein automatisch gemessener Zeitnachweis. Die erste Lektion bleibt ungefähr zehn Minuten lang und kann unterbrochen werden.

Erinnerungen sind standardmäßig aus. Erst bewusstes Aktivieren fragt nach Mitteilungserlaubnis. Eine lokale tägliche Mitteilung zur gewählten Gerätezeit ersetzt die bisherige Planung, ohne Ton oder Badge. Kein Push-Token, kein Benachrichtigungsserver. Die Einstellungen zeigen verweigerte Berechtigungen und Planungsfehler. Systemeinstellungen können Zustellung verzögern.

Beim ersten Einstieg in eine noch nicht abgeschlossene Lektion pro lokalem Kalendertag erscheint ein wechselnder ermutigender Satz, zuerst auf Spanisch und darunter auf Deutsch oder Englisch. Nach „Los geht’s“ wird er an diesem Tag nicht erneut gezeigt. Die Texte sind eigene App-Texte; dezente Hintergrundsymbole sind für Screenreader ausgeblendet.

## Korrektur der Sprachausgabe

Vorschau und Lernphrasen nutzen eine gemeinsame, geordnete Wiedergabe. Vor jeder Ausgabe werden vorherige Stimmen gestoppt, die Audio-Session für Wiedergabe auch bei aktivem Lautlosmodus konfiguriert und aktiviert. Die Sprachausgabe verwendet diese Session mit voller relativer Ausgabelautstärke. Es wird weder die Medienlautstärke des Geräts verstellt noch ein Mikrofonzugriff angefordert. Fehler beim Vorbereiten der Audio-Session erscheinen als Hinweis. Schnelle erneute Tastendrücke ersetzen wartende Ausgaben.

## Vorbereitung: genau zwei feste Offline-Stimmen

`AUDIO-PRODUKTION.md` und `assets/audio/spanish/recording-script.csv` enthalten 17 spanische Texte für Lucía (weiblich) und Mateo (männlich), jeweils natürlich und separat langsam gesprochen: 68 MP3-Dateien. Noch keine dieser Aufnahmen ist vorhanden oder freigegeben. Die installierte iPhone-Version nutzt weiterhin die bereits hörbar bestätigte Gerätesprachausgabe; in diesem Schritt wurde kein neues App-Paket installiert.

Die vorbereitete Dateiwiedergabe wird erst aktiv, wenn beide Stimmen in beiden Sprechweisen vollständig vorliegen. `node scripts/build-recorded-audio.mjs` prüft Dateien, MP3-Kopf, Produktionsquelle/Nutzungsnachweis und die nach Hörprüfung dokumentierten SHA-256-Werte. Erst `--write` erzeugt die statischen lokalen Asset-Verweise. Die Freigabe bezieht sich auf die konkrete Datei; ein späterer Dateitausch verlangt eine neue Prüfung. Decoder- und Hörprüfung bleiben zusätzlich notwendig.

Nach Freischaltung zeigt die App genau zwei Stimmen und die zwei Sprechweisen. Ohne vollständigen Aufnahmesatz bleiben die bestehenden Systemstimmen verfügbar. Bessere Klangqualität ist erst mit den tatsächlichen abgenommenen Audios erreichbar. Fal war bei der Prüfung noch nicht vollständig für Audioerzeugung eingerichtet; die Webseite verlangte Zahlungsdaten/Guthaben und die Kontoverbindung.
