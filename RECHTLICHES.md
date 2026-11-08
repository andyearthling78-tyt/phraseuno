# Rechtsbereich – Arbeitsstand

Stand: 8. November 2026. Ausrichtung dieses Entwurfs: Deutschland / EU.

## Eingebaut

Über das Info-Symbol im Kopf jeder App-Seite sind Impressum, Datenschutzhinweise, Nutzungshinweise und Open-Source-Lizenzen erreichbar. Die Dokumente liegen in der App und benötigen keine Webseite. Der Lizenzbereich enthält Paketinformationen und die in den installierten Paketen bzw. CocoaPods vorhandenen Lizenztexte; einige Entwicklungswerkzeuge liefern nur eine Lizenzkennzeichnung mit.

Die Datenschutzbeschreibung folgt dem aktuellen Quellcode: lokale Lern- und Dialogdaten, kein eigenes Backend, kein Tracking und keine externe KI. Die Betriebssystem-Sprachausgabe, Tastatur-Diktat, Geräte-Backups und Entwicklungsbuilds sind gesondert beschrieben. Die App bietet Teilen und Löschen der lokalen Lerndaten an. Schreib- und Löschvorgänge laufen geordnet, damit ältere Speichervorgänge gelöschte Daten nicht zurückschreiben.

## Noch offen

Die vom Betreiber gelieferten Angaben sind im Impressum und als Verantwortlicher im Datenschutz hinterlegt: Andy Pimpertz, Am Hauweg 77, 47249 Duisburg, phrase_uno@gmx.de, USt-IdNr. DE268050119. Nicht gelieferte Unternehmensangaben wurden nicht erfunden. Die auf das konkrete Angebot passende Rechtsgrundlage für personenbezogene Daten bleibt vor einer Veröffentlichung zu ergänzen. Falls Anbieter, Geschäftsmodell oder Datenverarbeitung geändert werden, müssen die Texte entsprechend angepasst werden.

Anbieterangaben werden zentral in `src/lib/legal.ts` gepflegt. Die Texte sind Implementierungsentwürfe und keine Zusage rechtlicher Vollständigkeit. Es wurden keine pauschalen Haftungsausschlüsse, keine unnötige Einwilligungspflicht und keine Vertragsbedingungen für bisher nicht vorhandene Käufe erfunden.

## Verwendete Grundlagen

- § 5 DDG, Anbieterinformationen: https://www.gesetze-im-internet.de/ddg/__5.html
- DSGVO, insbesondere Art. 6, 13 und 15–21: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679
- § 25 Abs. 2 TDDDG, notwendiger Zugriff auf Geräteinformationen: https://www.gesetze-im-internet.de/ttdsg/__25.html

## Prüfung

TypeScript und ESLint bestanden. Acht automatisierte Tests bestanden, einschließlich geordneter Löschung und Fehlerbehandlung des Speichers. Im iOS-Simulator wurden Direktzugriff, Impressum, Datenschutzhinweise, Lizenzsuche, Lizenzdetail und der Abbruch des Löschdialogs geprüft. Bestehende Lerndaten wurden dabei nicht gelöscht.

Der aktualisierte iOS-Release-Build mit dem Rechtsbereich wurde erfolgreich kompiliert (null Buildfehler) und auf dem verbundenen iPhone installiert. Die Anbieterangaben wurden nachträglich anhand der ausdrücklich gelieferten Angaben vervollständigt.
