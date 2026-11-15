import type { L10n } from "../domain/types.ts";
// DRAFT legal texts describing what the app actually does. They need a legal review before release.
export type Section = { title: L10n; text: L10n };
export const LEGAL_VERSION = "2026-11-15";
export const privacy: Section[] = [
  { title: { de: "Kurz gesagt", en: "In short" }, text: {
    de: "PhraseUNO hat kein Nutzerkonto, keinen eigenen Server, keine Werbung und keine Analyse- oder Trackingdienste. Dein Lernstand bleibt auf deinem Gerät.",
    en: "PhraseUNO has no user account, no server of its own, no advertising and no analytics or tracking services. Your learning progress stays on your device." } },
  { title: { de: "Lernstand und Einstellungen", en: "Progress and settings" }, text: {
    de: "Lerntage, Wiederholungsplan, Punkte, Serie und Einstellungen werden nur lokal auf deinem Gerät gespeichert. Du löschst sie im Profil über „Lernstand löschen“ oder durch Deinstallieren der App.",
    en: "Learning days, review schedule, points, streak and settings are stored only locally on your device. You delete them in your profile via “Delete progress” or by uninstalling the app." } },
  { title: { de: "Mikrofon und Spracherkennung", en: "Microphone and speech recognition" }, text: {
    de: "Das Mikrofon wird nur verwendet, wenn du auf das Mikrofon tippst. Deine Stimme wird durch die Spracherkennung deines Geräts in Text umgewandelt. Die App verlangt Erkennung auf dem Gerät und wechselt nicht automatisch zu einem Online-Dienst. Es wird keine Tondatei gespeichert; der erkannte Text wird nur kurz angezeigt und nicht gespeichert. Geprüft werden erkannte Wörter, nicht deine Aussprache. Grundlage ist deine Einwilligung (Art. 6 Abs. 1 Buchst. a DSGVO), die du jederzeit in den Geräteeinstellungen widerrufen kannst. Ohne Mikrofon kannst du tippen.",
    en: "The microphone is only used when you tap the microphone button. Your voice is converted into text by your device’s speech recognition. The app requires on-device recognition and does not switch to an online service automatically. No audio file is stored; the recognised text is shown briefly and not saved. The app checks recognised words, not your pronunciation. The basis is your consent (Art. 6(1)(a) GDPR), which you can withdraw at any time in your device settings. Without a microphone you can type." } },
  { title: { de: "Sprachausgabe", en: "Speech output" }, text: {
    de: "Spanische Sätze werden mit einer Stimme deines Geräts vorgelesen. Lädst du zusätzliche Stimmen, gelten dafür die Bedingungen des Systemanbieters (Apple bzw. Google).",
    en: "Spanish sentences are read aloud with a voice from your device. If you download additional voices, the terms of the system provider (Apple or Google) apply." } },
  { title: { de: "Erinnerungen", en: "Reminders" }, text: {
    de: "Die freiwillige tägliche Erinnerung wird lokal auf deinem Gerät geplant. Dafür werden keine Daten an uns übertragen.",
    en: "The optional daily reminder is scheduled locally on your device. No data is sent to us for this." } },
  { title: { de: "Käufe und Premium", en: "Purchases and Premium" }, text: {
    de: "Käufe werden über den Apple App Store bzw. Google Play abgewickelt; wir erhalten keine Zahlungsdaten wie Kartennummern. Um deinen Premium-Status zu prüfen und wiederherzustellen, nutzen wir den Dienst RevenueCat (RevenueCat, Inc., USA) als Auftragsverarbeiter. Dabei werden eine zufällige App-Nutzerkennung, Kauf- und Abodaten aus dem Store sowie technische Angaben wie Gerätetyp, Betriebssystem, App-Version und IP-Adresse verarbeitet. Grundlage ist die Vertragserfüllung (Art. 6 Abs. 1 Buchst. b DSGVO). Ohne Kauf findet diese Verarbeitung nur zum Abruf der Angebote statt.",
    en: "Purchases are handled by the Apple App Store or Google Play; we do not receive payment details such as card numbers. To verify and restore your Premium status we use the RevenueCat service (RevenueCat, Inc., USA) as a processor. It processes a random app user identifier, purchase and subscription data from the store and technical details such as device type, operating system, app version and IP address. The basis is performance of the contract (Art. 6(1)(b) GDPR). Without a purchase, this processing only takes place to load the offers." } },
  { title: { de: "Deine Rechte", en: "Your rights" }, text: {
    de: "Du hast nach der DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren. Wende dich dazu an die im Impressum genannte Adresse.",
    en: "Under the GDPR you have in particular the right of access, rectification, erasure, restriction, data portability and objection, and the right to lodge a complaint with a data protection authority. Please use the contact details in the legal notice." } },
  { title: { de: "Alter", en: "Age" }, text: {
    de: "PhraseUNO richtet sich an Erwachsene und Jugendliche ab 16 Jahren.",
    en: "PhraseUNO is intended for adults and teens aged 16 and over." } },
];
export const terms: Section[] = [
  { title: { de: "Was PhraseUNO ist", en: "What PhraseUNO is" }, text: {
    de: "PhraseUNO ist eine App zum Sprachenlernen mit Sätzen. Die Dialoge folgen festen Regeln; Lucía und Mateo sind Simulationen und keine angebundene künstliche Intelligenz. Die Übungen sind Lernhilfen und kein anerkanntes Zertifikat. Ein bestimmter Lernerfolg wird nicht zugesagt.",
    en: "PhraseUNO is an app for learning languages with sentences. The dialogues follow fixed rules; Lucía and Mateo are simulations, not a connected artificial intelligence. The exercises are learning aids and not a recognised certificate. No particular learning outcome is promised." } },
  { title: { de: "Kostenlos und Premium", en: "Free and Premium" }, text: {
    de: "Die erste Lernwoche ist kostenlos. Weitere Lernwochen sind Teil von Premium. Premium gibt es als Monats- oder Jahresabo oder als Einmalkauf. Preise und Laufzeiten siehst du vor dem Kauf in der App.",
    en: "The first learning week is free. Further learning weeks are part of Premium. Premium is available as a monthly or yearly subscription or as a one-time purchase. Prices and terms are shown in the app before you buy." } },
  { title: { de: "Abos", en: "Subscriptions" }, text: {
    de: "Abos verlängern sich automatisch um die gewählte Laufzeit, wenn du sie nicht rechtzeitig vor Ablauf in den Einstellungen deines Store-Kontos kündigst. Zahlung, Kündigung und Erstattung richten sich nach den Bedingungen des jeweiligen Stores.",
    en: "Subscriptions renew automatically for the chosen period unless you cancel them in your store account settings in good time before they end. Payment, cancellation and refunds follow the terms of the respective store." } },
  { title: { de: "Spracherkennung", en: "Speech recognition" }, text: {
    de: "Die Spracherkennung stammt von deinem Gerät und kann Wörter falsch verstehen. Du kannst jede gesprochene Antwort auch tippen.",
    en: "Speech recognition is provided by your device and may misunderstand words. You can type any spoken answer instead." } },
];
