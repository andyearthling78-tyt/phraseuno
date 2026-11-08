export const legalVersion = "8. November 2026";
// Only publish details explicitly supplied by the operator. Empty values stay visible as missing.
export const provider = {
  name: "Andy Pimpertz",
  address: "Am Hauweg 77\n47249 Duisburg\nDeutschland",
  email: "phrase_uno@gmx.de",
  legalForm: "",
  representative: "",
  register: "",
  vatId: "DE268050119",
  privacyContact: "",
};
export const providerComplete = Boolean(
  provider.name && provider.address && provider.email,
);
export const privacySections = [
  {
    title: "Lernstimme, Tagesziel und Erinnerungen",
    text: "Stimmwahl, Tageslernziel, Onboarding-Abschluss, Datum des letzten Lernmoments und Erinnerungseinstellungen werden zusätzlich zur Sprachwahl lokal gespeichert. Sie bleiben beim Löschen der Lerndaten erhalten und sind in den Einstellungen änderbar. Erinnerungen sind freiwillig, standardmäßig ausgeschaltet und werden nach deiner Freigabe einmal täglich zur gewählten Geräte-Uhrzeit lokal geplant. PhraseUNO verwendet dafür keine Push-Token und keinen Benachrichtigungsserver. Die Erinnerung enthält nur einen allgemeinen Lernhinweis, keine Dialogantworten oder Lernstände. Du kannst sie in der App abschalten oder die Mitteilungserlaubnis im Betriebssystem entziehen.",
  },
  {
    title: "Deine Sprachwahl",
    text: "Die App erkennt die bevorzugten Sprachen deines Geräts. Du kannst Deutsch, Englisch oder die Gerätesprache wählen. Diese Einstellung wird separat vom Lernfortschritt lokal gespeichert und nicht an den Betreiber übermittelt. „Lerndaten löschen“ entfernt deine Lern- und Dialogdaten; deine Sprachwahl bleibt erhalten.",
  },
  {
    title: "Wer verantwortlich ist",
    text: providerComplete
      ? `${provider.name}\n${provider.address}\nKontakt: ${provider.privacyContact || provider.email}`
      : "Verantwortlich ist der im Impressum genannte Anbieter von PhraseUNO. Die Anbieter- und Kontaktdaten sind derzeit noch nicht hinterlegt. Diese Datenschutzhinweise sind deshalb ein Entwurf für den aktuellen Prototyp, keine abgeschlossene Information für eine Veröffentlichung.",
  },
  {
    title: "Dein Lernstand auf dem Gerät",
    text: "PhraseUNO speichert den aktuellen Lernabschnitt, gelöste Phrasen, Dialogfortschritt, deine eingegebenen Dialogantworten, Rückmeldungen der simulierten Lehrerin, als gelernt markierte Wörter und den Zeitpunkt des Tagesabschlusses lokal auf deinem Gerät. So kannst du später weiterlernen. Der Dialog enthält höchstens die letzten 100 Nachrichten. Bitte gib keine sensiblen oder fremden personenbezogenen Angaben in die Übungen ein.",
  },
  {
    title: "Zweck und rechtliche Einordnung",
    text: "Die lokale Speicherung dient ausschließlich der von dir gestarteten Lernfunktion und ihrer Fortsetzung. Für den notwendigen Zugriff auf den Gerätespeicher wird § 25 Abs. 2 Nr. 2 TDDDG zugrunde gelegt. Soweit dabei personenbezogene Daten verarbeitet werden, ist die passende Rechtsgrundlage nach Art. 6 DSGVO vor einer Veröffentlichung anhand des tatsächlichen Angebots durch den Anbieter festzulegen und hier zu ergänzen. Diese App verlangt keine pauschale Datenschutz-Einwilligung.",
  },
  {
    title: "Keine eigenen Nutzerkonten oder Analysedienste",
    text: "Der aktuelle eigenständige App-Build hat keine Registrierung, kein Betreiber-Backend, keine Cloud-Synchronisierung, keine Werbung und keine eingebundenen Nutzungsanalyse- oder Trackingdienste. Die Übungen und die Prüfung der Textantworten laufen in der App. Es gibt keine automatische Übermittlung der Lernantworten an einen KI-Anbieter; Lucía ist eine lokale Dialogsimulation.",
  },
  {
    title: "Sprachausgabe und Tastatur",
    text: "Wenn du auf das Notensymbol tippst, übergibt die App die jeweilige spanische Lernphrase an den Sprachdienst deines Betriebssystems. Ob Stimmen oder Sprachdienste eine Internetverbindung verwenden, hängt von Gerät, Einstellungen und Anbieter ab. PhraseUNO nimmt selbst keinen Ton auf und fordert keinen Mikrofonzugriff an. Verwendest du die Diktierfunktion deiner Systemtastatur, gelten zusätzlich die Datenschutzinformationen des Betriebssystem- bzw. Tastaturanbieters.",
  },
  {
    title: "Speicherdauer, Löschung und Geräte-Backups",
    text: "Dein Lernstand bleibt gespeichert, bis du ihn über „Lerndaten löschen“ entfernst oder die App-Daten über dein Betriebssystem löschst. Der App-Speicher hat keine zusätzliche app-eigene Verschlüsselung. Geräte- oder Cloud-Backups können je nach Betriebssystemeinstellungen Kopien enthalten. Eine Löschung in der App löscht solche extern verwalteten Backups nicht; deren Verwaltung liegt bei dir und dem jeweiligen Anbieter.",
  },
  {
    title: "Wenn du Daten selbst teilst",
    text: "Über „Lerndaten teilen“ kannst du den aktuellen lokalen Datensatz als Text an die Teilen-Funktion deines Geräts übergeben. Erst wenn du dort ein Ziel auswählst und den Vorgang abschließt, teilst du die Daten mit diesem Ziel. Prüfe vor dem Teilen den Inhalt und die ausgewählte Empfänger-App. Die Funktion sendet nichts automatisch an den Betreiber.",
  },
  {
    title: "Deine Rechte",
    text: "Soweit die DSGVO anwendbar ist, kannst du unter den jeweiligen gesetzlichen Voraussetzungen Auskunft, Berichtigung, Löschung, Einschränkung und Datenübertragbarkeit verlangen. Ein Widerspruch ist insbesondere bei einer Verarbeitung nach Art. 6 Abs. 1 Buchst. e oder f DSGVO möglich; eine erteilte Einwilligung kann für die Zukunft widerrufen werden. Du kannst dich bei einer zuständigen Datenschutzaufsichtsbehörde beschweren. Nutze für Anfragen phrase_uno@gmx.de oder die Anschrift im Impressum. Der Betreiber kann ohne eine von dir veranlasste Übermittlung nicht auf deinen lokalen App-Speicher zugreifen.",
  },
  {
    title: "Entwicklungs- und Testversionen",
    text: "Diese Hinweise beschreiben die eigenständige App. Bei einem Entwicklungsbuild können der verbundene Entwicklungsserver und Entwicklungswerkzeuge zusätzliche technische Verbindungs- und Fehlerdaten verarbeiten. Die bestehende Browser-Demo ist ein separates Angebot und wird von diesen App-Hinweisen nicht erfasst.",
  },
];
export const usageSections = [
  {
    title: "Aktueller Umfang",
    text: "PhraseUNO ist ein Lernprototyp für den ersten Spanisch-Lerntag im Café. Die derzeitige Version enthält keine Käufe, Abonnements oder kostenpflichtigen Leistungen und kein Nutzerkonto. Weitere Lerntage sind noch nicht enthalten.",
  },
  {
    title: "Simulierter Sprachlehrer",
    text: "Lucía antwortet anhand festgelegter Dialogregeln und gibt Hilfen zu den Lernphrasen. Sie ist in diesem Prototyp keine angebundene generative KI. Die Übungen sind Lernhilfen und kein Sprachtest oder anerkanntes Zertifikat. Eine bestimmte Lerngeschwindigkeit oder ein bestimmter Lernerfolg wird nicht zugesagt.",
  },
  {
    title: "Deine Eingaben",
    text: "Nutze den Dialog für die Lernaufgaben. Gib keine vertraulichen Angaben, Kontodaten oder personenbezogenen Informationen anderer Personen ein. Dein Fortschritt bleibt auf dem jeweiligen Gerät; es gibt keine Sicherung beim Betreiber und keine automatische Übertragung auf ein anderes Gerät.",
  },
  {
    title: "Inhalte und Software",
    text: "Rechte an App-Inhalten und Software richten sich nach den jeweils anwendbaren gesetzlichen Vorschriften und Lizenzen. Die Hinweise zu verwendeter Open-Source-Software findest du unter „Open-Source-Lizenzen“. Diese Nutzungshinweise enthalten keinen pauschalen Haftungsausschluss und ersetzen keine gegebenenfalls später erforderlichen Vertragsbedingungen.",
  },
];
