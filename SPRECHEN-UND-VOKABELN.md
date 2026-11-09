# Hören, Sprechen und Wochenvokabeln

Stand: 9. November 2026, Build 3.

Beim Öffnen eines Phrasenschritts liest Lucía den vollständigen Satz automatisch vor. „Noch einmal hören“ wiederholt ihn. Danach startet ein bewusster Tipp auf „Satz nachsprechen“ das Mikrofon. Im Dialog liest Lucía ihre Frage vor; „Antwort sprechen“ erkennt die gesprochene Antwort. Schreiben öffnet sich nur über die optionale Zusatzfunktion.

Die Erkennung verlangt Spanisch (es-ES) auf dem Gerät. Mikrofonerlaubnis und ein geeignetes Offline-Sprachmodell sind erforderlich. Android benötigt dafür ein Gerät mit verfügbarer On-device-Erkennung (in dieser Integration Android 13+). Ohne passende Erkennung zeigt die App einen Hinweis; sie wechselt nicht unbemerkt zu einem Server. Es gibt keinen API-Schlüssel und keine gespeicherte Audiodatei. Ein erkannter Satz ist keine Bewertung von Akzent oder Aussprache. Erkannte Dialogantworten werden wie bisherige Texteingaben lokal gespeichert. Die Aufnahme endet bei Abschluss, Abbruch, Navigation oder Hintergrundwechsel und ist zeitlich begrenzt.

Das iOS-Paket `expo-speech-recognition` ist auf 58.0.1 fixiert. Der reproduzierbare `postinstall`-Schritt setzt `requiresOnDeviceRecognition` auf dem nativen Request auch dann, wenn die Zielsprache es nicht unterstützt. Dadurch soll das Betriebssystem einen Fehler liefern statt still zur Servererkennung zu wechseln. Die Datei wird beim Installieren geprüft; eine unpassende Bibliotheksversion führt zu einem Fehler und verlangt erneute Prüfung. Android verwendet den nativen On-device-Recognizer. Ein echtes Erkennungs-/Netzwerkverhalten ist vor Store-Freigabe für beide Plattformen zu prüfen.

Nach der vierten erfolgreichen Dialogantwort öffnet die Vokabel-Zusatzübung automatisch. Der Sprechlerntag ist geschafft; die Vokabeln können für später verschoben werden. Der Reiter „Meine Wörter“ enthält „Dieser Lerntag“ und „Diese Woche“, Hörbeispiele und eine freiwillige Kartenrunde. Die Wochensammlung enthält nur Wörter aus erfolgreichen Lerntagen, doppelte Wörter einmal. Die sieben Tage ergeben 20 unterschiedliche Wörter. Geübte/offene Wörter bleiben über App-Neustarts erhalten.

Die Wochenfreigabe verlangt alle sieben erfolgreichen Dialoge und alle gesammelten Wörter als geübt. Einzelne Tage dürfen vorher fortgesetzt werden. Die App enthält weiterhin eine Lernwoche; Woche 2 wird nicht als vorhandener Inhalt vorgetäuscht. Die Freigabebedingung und der Wochenabschluss sind implementiert, weitere Kurswochen müssen noch als Inhalt ergänzt werden.

Die bisherigen Lerndaten werden übernommen. Schriftliche Antworten bleiben eine Alternative bei fehlender Berechtigung, fehlendem Sprachmodell oder wenn gerade nicht laut gesprochen werden kann.
