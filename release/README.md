# PhraseUNO – Store-Paket

Stand: 9. November 2026 · Version 1.0.0 (Build 2). **Vorbereitet, nicht eingereicht.** Die native App läuft ohne Browser. Die erste Woche enthält sieben Lerntage auf Deutsch und Englisch, mit vier Phrasen, vier Dialogantworten und drei Wörtern pro Tag. Vorhandener Tag-1-Fortschritt wird übernommen.

## Enthalten

- `metadata.json` und `metadata/`: Store-Beschreibungen für de-DE, en-US und en-GB, Keywords, Kurztexte und Kategorien; Zeichenlängen geprüft.
- `screenshots/ios-iphone/`: vier deutsche und fünf englische echte Simulatoraufnahmen in 1206 × 2622; `ios-ipad/`: je eine in 2064 × 2752. PNG/RGB ohne Alpha. Englische Bilder gelten für USA und UK. Keine Webansichten oder nachgebauten Android-Bilder.
- `graphics/`: Store-Icons 512/1024 Pixel und Google-Feature-Grafiken 1024 × 500 auf Deutsch und Englisch.
- `legal-site/`: statische Rechts- und Supportseiten in beiden Sprachen. Noch nicht öffentlich gehostet; die Hosting-Datenschutzbeschreibung muss zum tatsächlichen Anbieter passen.
- `data-safety.json`: begründeter Entwurf für „keine Datenerhebung/kein Tracking“, vorbehaltlich finaler SDK-, Betriebssystem- und Binärprüfung.
- `legal-review.md`: überarbeitete Texte, konkrete Interessenabwägung und verbleibende rechtliche/organisatorische Fragen. Keine anwaltliche Freigabe.
- `ios-privacy-audit.json`: Prüfung von 14 Datenschutzmanifesten im tatsächlichen iOS-Release-Simulatorpaket. Kein Ersatz für die Prüfung des signierten Store-Archivs oder von Netzwerkverkehr.
- `review-notes.txt`: Hinweise für Store-Prüfer, ohne Testkonto.
- `release-status.json`: maschinenlesbarer Prüfstand und alle offenen Freigaben.

Die Kontakt-Telefonnummer ist mit den gelieferten Angaben übernommen. Sie ist zusammen mit der Anbieteranschrift in App und Rechtstexten sichtbar. Händlerdaten müssen in den Store-Konten zusätzlich eingetragen/verifiziert werden.

## Geprüft

27 automatisierte Tests, TypeScript, ESLint und native Hermes-Bundles für beide Plattformen bestanden. Der iOS-Release-Simulator-Build war erfolgreich. Tag 2 wurde komplett durchgespielt; Tag 1 blieb nach Migration abgeschlossen. Neustart erhält beide Abschlüsse und die Auswahl von Tag 3. Auf dem iPad wurden Onboarding, Deutsch und Englisch geprüft. Der aktuelle Quellstand wurde zusätzlich als nativer Release-Build für das iPhone 13 erfolgreich erstellt (null Fehler), vollständig installiert und am 9. November 2026 gestartet. Vor Store-Einreichung bleiben das signierte Distributionsarchiv und abschließende Gerätetests erforderlich.

Die festen Aufnahmen sind noch nicht produziert/freigegeben. Die App nutzt weiterhin Gerätestimmen. Es wurde keine kostenpflichtige Audioerzeugung ausgelöst.

## Nächste Veröffentlichungsschritte

1. Rechtsentwürfe abschließend fachlich prüfen lassen und Betreiberpflichten bestätigen. Eine Übersetzung alleine ist keine Freigabe für USA/UK.
2. Datenschutz und Support unter eigenen öffentlichen HTTPS-Adressen bereitstellen; Hosting-Verarbeitung ergänzen und URLs in `metadata.json` eintragen.
3. Die neue Sieben-Tage-Version ist auf dem iPhone installiert und gestartet. Android-Umgebung oder autorisierten Cloud-Build einrichten, APK/AAB erstellen und auf Android testen; echte Screenshots ergänzen.
4. Produktionssignierung und Händlerstatus in Apple-/Google-Konten prüfen. Diese Vorbereitung enthält weder Zugangsdaten noch Zertifikate. Altersbewertung aus den Store-Fragebögen bestimmen; Zielgruppe sind Erwachsene und ältere Jugendliche (16+), keine Kinder-App.
5. Finales signiertes Paket, Datenschutzerklärungen und Berechtigungen gemeinsam prüfen. TestFlight und Play-Test durchführen; sofern das persönliche Google-Konto unter die betreffende Regel fällt, zwölf Tester über vierzehn zusammenhängende Tage einplanen. Erst anschließend zur Veröffentlichung einreichen.

`node scripts/check-release.mjs` im Projekt prüft die gelieferten Materialien. `node scripts/check-release.mjs --submission` endet bewusst mit Fehlerstatus, solange Freigaben offen sind. Eine erfolgreiche Materialprüfung ist keine Veröffentlichungsfreigabe.

## Primärquellen

- [Apple-Datenschutzangaben](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple-Bildgrößen](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
- [Google Store-Grafiken](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google-Testanforderungen](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Apple EU-Händlerangaben](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)

Die Dateien können für die Einreichung verwendet werden, sobald die offenen Punkte erfüllt und die endgültigen Inhalte bestätigt sind. Es wurde keine Store-Veröffentlichung und keine öffentliche Website-Veröffentlichung ausgeführt.
