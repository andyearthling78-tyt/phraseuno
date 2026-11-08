# PhraseUNO – zwei feste spanische Lernstimmen

Status: Produktion vorbereitet; noch keine hochwertigen Audioaufnahmen vorhanden oder freigegeben.

Lucía: weiblich. Mateo: männlich. Beide sprechen denselben vollständigen Textsatz auf Spanisch (es-ES), jeweils natürlich und langsam zum Mitsprechen. Warm, ruhig, erwachsen, freundlich und klar; keine Cartoonstimme, kein übertriebenes Schauspiel. Akzente und Satzmelodie natürlich halten. Die langsame Fassung wird separat eingesprochen/erzeugt, nicht durch tieferes Abspielen der natürlichen Fassung.

Zuerst vier Hörproben desselben Preview-Texts (zwei Stimmen × zwei Sprechweisen) produzieren und anhören. Erst danach den vollständigen Satz produzieren: 17 Texte × zwei Stimmen × zwei Sprechweisen = 68 MP3-Dateien. Keine Hintergrundmusik. Dateien technisch decodieren und auf Stille, abgeschnittene Wörter, Lautheit und korrekte spanische Aussprache prüfen.

Quelle, verwendete feste Voice-ID bzw. Sprecher und Nutzungsnachweis für jede Stimme in production.json dokumentieren. Nur nach tatsächlichem Anhören den SHA-256-Wert der betreffenden MP3 unter ihrem Schlüssel in approvedSha256 eintragen. Der Prüfbefehl gibt die Schlüssel/fehlenden Hashes aus. Keine App-Nutzerdaten oder Zugangsschlüssel in diese Dateien schreiben.

Die Dateien liegen unter assets/audio/spanish. Die vollständige Dateiliste steht in recording-script.csv. Prüfung: node scripts/build-recorded-audio.mjs. Aktivierung erst nach vollständiger Abnahme: node scripts/build-recorded-audio.mjs --write. Danach npm run typecheck, npm run lint, npm test und npm run bundle:check. Die Datei recorded-assets.ts wird mit statischen lokalen Asset-Verweisen erzeugt; keine Laufzeit-API und kein Nutzerschlüssel erforderlich. Eine MP3-Kopfprüfung allein ersetzt keine Decoder-/Hörprüfung.

Bis zur vollständigen Freigabe bleibt die funktionierende Gerätesprachausgabe unverändert. Der vorbereitete Offline-Player ist noch kein Nachweis einer besseren Klangqualität. Fal ist als mögliche Erzeugungsquelle vorgesehen; Modell, Stimmen, Kosten und Nutzungsbedingungen sind vor Produktion zu prüfen.

## Texte

- preview: Hola. Quiero un café con leche, por favor.
- order-coffee: Quiero un café
- order-milk: Quiero un café con leche
- order-please: Quiero un café con leche, por favor
- order-takeaway: Quiero un café con leche, por favor, para llevar
- with-milk: con leche
- please: por favor
- to-go: para llevar
- word-coffee: el café
- word-milk: la leche
- word-take: llevar
- ask-order: ¡Hola! ¿Qué quieres tomar?
- ask-milk: ¿Solo o con leche?
- ask-takeaway: ¿Para tomar aquí o para llevar?
- ask-repeat: Muy bien. ¿Puedes repetir tu pedido completo?
- answer-milk: Con leche, por favor.
- answer-takeaway: Para llevar, por favor.
