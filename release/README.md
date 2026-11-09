# PhraseUNO – Store-Paket · Build 3

Stand: 9. November 2026 · Version 1.0.0 (Build 3). Vorbereitet, nicht eingereicht.

Die native App enthält sieben Lerntage auf Deutsch und Englisch. Der Schwerpunkt ist jetzt Zuhören, Nachsprechen und gesprochenes Antworten. Schreiben bleibt optional. Mikrofonzugriff wird erst nach Tastendruck gefragt; die Erkennung verlangt ein spanisches Offline-Modell und wechselt nicht automatisch ins Netz. Keine Tondatei wird gespeichert. Rückmeldungen prüfen erkannte Wörter, keine Aussprachequalität.

Nach einem erfolgreichen Dialog startet automatisch die Vokabel-Zusatzübung. Sie kann am Tag verschoben werden. „Meine Wörter“ bietet Tages- und Wochensammlung mit Karten und Hörbeispielen. Doppelte Wörter werden zusammengefasst. Die sieben Tage ergeben 20 unterschiedliche Wörter. Der Wochenabschluss verlangt alle sieben Tage und alle Wochenwörter. Weitere Kurswochen sind noch nicht enthalten.

31 Tests, TypeScript und ESLint bestanden. Hermes-Bundles für iOS/Android erstellt. Native iPhone- und Simulator-Builds erfolgreich. Der iPhone-Build wurde installiert und gestartet; danach wurden kleine UI-Korrekturen mit Expos finalem Hermes-Bundle eingebettet, streng signaturgeprüft und erfolgreich installiert. Der letzte Startversuch scheiterte an der Gerätesperre. Im Simulator sind Vorlesen/Ende, Mikrofonabfrage, Ablehnung, Tages-/Wochensammlung und echtes freiwilliges Schreibfeld geprüft. **Tatsächliche Erkennung gesprochener spanischer Sätze auf Hardware und Android-Gerätetests stehen aus.**

Enthalten: `metadata.json` und `metadata/` (DE/USA/UK), `legal-site/` (noch nicht öffentlich gehostete Rechts-/Supportseiten), `legal-review.md`, `data-safety.json`, `ios-privacy-audit.json`, `review-notes.txt`, `release-status.json`, Store-Grafiken und historische iOS-Screenshots. Die bisherigen Store-Bilder zeigen überwiegend Build 2; vor Einreichung gegen aktuelle Sprechansichten austauschen. Sie sind im Bildmanifest ausdrücklich als historisch markiert.

Offen bleiben juristische Endfreigabe, öffentliche HTTPS-Adressen samt Hosting-Datenschutz, finale Signierung/Store-Archive, Datenschutzerklärungen und Altersfragebögen in den Konten sowie TestFlight-/Google-Play-Tests. Zielgruppe: Erwachsene und ältere Jugendliche, keine Kinder-App. Die vorbereiteten Datenschutzangaben müssen mit den finalen Paketen abgeglichen werden. Es wurde weder eine Store-Einreichung noch eine Website-Veröffentlichung ausgeführt.

Materialprüfung im Projekt: `node scripts/check-release.mjs`. Der Zusatz `--submission` liefert einen Fehlerstatus, solange Veröffentlichungspunkte offen sind. Weitere technische Details stehen in `SPRECHEN-UND-VOKABELN.md` im Projekt.

Primärquellen: [Apple Datenschutz](https://developer.apple.com/app-store/app-privacy-details/), [Google Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469), [Spracherkennungsbibliothek](https://github.com/jamsch/expo-speech-recognition).
