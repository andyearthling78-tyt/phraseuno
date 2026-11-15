import type { Week } from "../../domain/types.ts";
import { day } from "./build.ts";
// Week 2 (Premium): people and everyday situations. Reuses week 1 chunks on purpose (spiral curriculum).
export const week2: Week = {
  id: 2,
  title: { de: "Menschen und Alltag", en: "People and everyday life" },
  days: [
    day(2, 1, "👋", "Sich vorstellen", "Introducing yourself", [
      ["Me llamo Ana", "Me llamo Ana", "Ich heiße Ana.", "My name is Ana.", "„Me llamo“ + dein Name.", "“Me llamo” + your name."],
      ["Me llamo Ana y soy de Alemania", "y soy de Alemania", "Ich heiße Ana und komme aus Deutschland.", "My name is Ana and I'm from Germany.", "„Soy de …“ = ich komme aus …", "“Soy de …” = I'm from …"],
      ["Me llamo Ana y soy de Alemania. Vivo en Berlín", "Vivo en Berlín", "Ich heiße Ana und komme aus Deutschland. Ich wohne in Berlin.", "My name is Ana and I'm from Germany. I live in Berlin.", "„Vivo en …“ = ich wohne in …", "“Vivo en …” = I live in …"],
      ["Me llamo Ana y soy de Alemania. Vivo en Berlín con mi familia", "con mi familia", "Ich heiße Ana und komme aus Deutschland. Ich wohne mit meiner Familie in Berlin.", "My name is Ana and I'm from Germany. I live in Berlin with my family.", "„mi“ = mein/meine.", "“mi” = my."],
    ], [
      ["¡Hola! ¿Cómo te llamas?", "Hallo! Wie heißt du?", "Hi! What's your name?", "Me llamo Ana.", "Ich heiße Ana.", "My name is Ana.", [["me llamo"], ["soy"]]],
      ["¿De dónde eres?", "Woher kommst du?", "Where are you from?", "Soy de Alemania.", "Ich komme aus Deutschland.", "I'm from Germany.", [["soy de"]]],
      ["¿Dónde vives?", "Wo wohnst du?", "Where do you live?", "Vivo en Berlín.", "Ich wohne in Berlin.", "I live in Berlin.", [["vivo en"]]],
      ["¿Con quién vives?", "Mit wem wohnst du?", "Who do you live with?", "Con mi familia.", "Mit meiner Familie.", "With my family.", [["con mi"], ["solo"], ["sola"]]],
    ], [
      ["el nombre", "der Name", "name", "🏷️", "A nombre de Ana."],
      ["Alemania", "Deutschland", "Germany", "🇩🇪", "Soy de Alemania."],
      ["la familia", "die Familie", "family", "👨‍👩‍👧", "Vivo con mi familia."],
    ]),
    day(2, 2, "🙂", "Wie geht’s?", "How are you?", [
      ["Estoy bien", "Estoy bien", "Mir geht es gut.", "I'm fine.", "„Estoy“ = ich bin (gerade).", "“Estoy” = I am (right now)."],
      ["Estoy bien, gracias", "gracias", "Mir geht es gut, danke.", "I'm fine, thanks.", "„gracias“ = danke.", "“gracias” = thanks."],
      ["Estoy bien, gracias. ¿Y tú?", "¿Y tú?", "Mir geht es gut, danke. Und dir?", "I'm fine, thanks. And you?", "„¿Y tú?“ gibt die Frage zurück.", "“¿Y tú?” returns the question."],
      ["Estoy bien, gracias. ¿Y tú? ¿Cómo estás?", "¿Cómo estás?", "Mir geht es gut, danke. Und dir? Wie geht es dir?", "I'm fine, thanks. And you? How are you?", "„¿Cómo estás?“ = Wie geht es dir?", "“¿Cómo estás?” = How are you?"],
    ], [
      ["¡Hola! ¿Qué tal?", "Hallo! Wie geht’s?", "Hi! How's it going?", "Bien, gracias. ¿Y tú?", "Gut, danke. Und dir?", "Fine, thanks. And you?", [["bien"]], ["no estoy bien"]],
      ["Un poco cansado. ¿Cómo estás tú?", "Ein bisschen müde. Wie geht es dir?", "A bit tired. How are you?", "Estoy bien.", "Mir geht es gut.", "I'm fine.", [["bien"], ["cansado"], ["cansada"]]],
      ["¿Mucho trabajo?", "Viel Arbeit?", "Lots of work?", "Sí, mucho trabajo.", "Ja, viel Arbeit.", "Yes, lots of work.", [["si"], ["no"], ["trabajo"]]],
      ["¡Ánimo! Hasta luego.", "Kopf hoch! Bis später.", "Hang in there! See you later.", "Hasta luego.", "Bis später.", "See you later.", [["hasta luego"], ["adios"]]],
    ], [
      ["bien", "gut", "well", "👍", "Estoy bien, gracias."],
      ["cansado", "müde", "tired", "😴", "Estoy un poco cansado."],
      ["el trabajo", "die Arbeit", "work", "💼", "¿Mucho trabajo?"],
    ]),
    day(2, 3, "💳", "Bezahlen", "Paying", [
      ["La cuenta", "La cuenta", "Die Rechnung.", "The bill.", "„la cuenta“ = die Rechnung.", "“la cuenta” = the bill."],
      ["La cuenta, por favor", "por favor", "Die Rechnung, bitte.", "The bill, please.", "So bittest du im Restaurant um die Rechnung.", "This is how you ask for the bill."],
      ["La cuenta, por favor. ¿Puedo pagar?", "¿Puedo pagar?", "Die Rechnung, bitte. Kann ich zahlen?", "The bill, please. Can I pay?", "„¿Puedo…?“ = Kann ich …?", "“¿Puedo…?” = Can I …?"],
      ["La cuenta, por favor. ¿Puedo pagar con tarjeta?", "con tarjeta", "Die Rechnung, bitte. Kann ich mit Karte zahlen?", "The bill, please. Can I pay by card?", "„con tarjeta“ = mit Karte.", "“con tarjeta” = by card."],
    ], [
      ["¿Algo más?", "Noch etwas?", "Anything else?", "No, gracias. La cuenta, por favor.", "Nein, danke. Die Rechnung, bitte.", "No, thanks. The bill, please.", [["la cuenta"]]],
      ["Son veinte euros.", "Das macht zwanzig Euro.", "That's twenty euros.", "¿Puedo pagar con tarjeta?", "Kann ich mit Karte zahlen?", "Can I pay by card?", [["con tarjeta"], ["tarjeta"]]],
      ["Lo siento, solo en efectivo.", "Tut mir leid, nur bar.", "Sorry, cash only.", "Vale, en efectivo.", "Okay, bar.", "Okay, cash.", [["efectivo"], ["vale"]]],
      ["Aquí tiene el cambio.", "Hier ist Ihr Wechselgeld.", "Here's your change.", "Muchas gracias.", "Vielen Dank.", "Thank you very much.", [["gracias"]]],
    ], [
      ["la cuenta", "die Rechnung", "bill", "🧾", "La cuenta, por favor."],
      ["la tarjeta", "die Karte", "card", "💳", "¿Puedo pagar con tarjeta?"],
      ["el efectivo", "das Bargeld", "cash", "💶", "Solo en efectivo."],
    ]),
    day(2, 4, "👕", "Im Geschäft", "In the shop", [
      ["Busco una camiseta", "Busco una camiseta", "Ich suche ein T-Shirt.", "I'm looking for a T-shirt.", "„Busco“ kennst du vom Bahnhof.", "You know “Busco” from the station."],
      ["Busco una camiseta azul", "azul", "Ich suche ein blaues T-Shirt.", "I'm looking for a blue T-shirt.", "Die Farbe steht hinter dem Wort.", "The colour comes after the noun."],
      ["Busco una camiseta azul más grande", "más grande", "Ich suche ein größeres blaues T-Shirt.", "I'm looking for a bigger blue T-shirt.", "„más grande“ = größer.", "“más grande” = bigger."],
      ["Busco una camiseta azul más grande. ¿Cuánto cuesta?", "¿Cuánto cuesta?", "Ich suche ein größeres blaues T-Shirt. Wie viel kostet es?", "I'm looking for a bigger blue T-shirt. How much is it?", "Die Frage vom Markt passt auch hier.", "The market question works here too."],
    ], [
      ["¡Hola! ¿Puedo ayudarte?", "Hallo! Kann ich dir helfen?", "Hi! Can I help you?", "Sí, busco una camiseta.", "Ja, ich suche ein T-Shirt.", "Yes, I'm looking for a T-shirt.", [["busco", "camiseta"]]],
      ["¿De qué color?", "In welcher Farbe?", "What colour?", "Azul.", "Blau.", "Blue.", [["azul"]]],
      ["¿Esta está bien?", "Ist dieses in Ordnung?", "Is this one okay?", "Más grande, por favor.", "Größer, bitte.", "Bigger, please.", [["mas grande"], ["si"]]],
      ["Aquí tienes.", "Bitte schön.", "Here you are.", "¿Cuánto cuesta?", "Wie viel kostet es?", "How much is it?", [["cuanto cuesta"], ["cuanto es"]]],
    ], [
      ["la camiseta", "das T-Shirt", "T-shirt", "👕", "Busco una camiseta."],
      ["azul", "blau", "blue", "🔵", "Una camiseta azul."],
      ["grande", "groß", "big", "↔️", "Más grande, por favor."],
    ]),
    day(2, 5, "🚕", "Taxi bestellen", "Ordering a taxi", [
      ["Necesito un taxi", "Necesito un taxi", "Ich brauche ein Taxi.", "I need a taxi.", "„Necesito“ = ich brauche.", "“Necesito” = I need."],
      ["Necesito un taxi al aeropuerto", "al aeropuerto", "Ich brauche ein Taxi zum Flughafen.", "I need a taxi to the airport.", "„al“ = a + el: zum.", "“al” = a + el: to the."],
      ["Necesito un taxi al aeropuerto mañana", "mañana", "Ich brauche morgen ein Taxi zum Flughafen.", "I need a taxi to the airport tomorrow.", "„mañana“ = morgen.", "“mañana” = tomorrow."],
      ["Necesito un taxi al aeropuerto mañana a las ocho", "a las ocho", "Ich brauche morgen um acht ein Taxi zum Flughafen.", "I need a taxi to the airport tomorrow at eight.", "Uhrzeit: „a las“ + Zahl.", "Time: “a las” + number."],
    ], [
      ["Hotel Sol, ¿dígame?", "Hotel Sol, ja bitte?", "Hotel Sol, how can I help?", "Necesito un taxi.", "Ich brauche ein Taxi.", "I need a taxi.", [["taxi"]]],
      ["¿Adónde va?", "Wohin fahren Sie?", "Where are you going?", "Al aeropuerto.", "Zum Flughafen.", "To the airport.", [["aeropuerto"]]],
      ["¿Para cuándo?", "Für wann?", "For when?", "Mañana a las ocho.", "Morgen um acht.", "Tomorrow at eight.", [["manana"], ["a las"]]],
      ["Muy bien. Mañana a las ocho.", "Sehr gut. Morgen um acht.", "Very good. Tomorrow at eight.", "Perfecto, gracias.", "Perfekt, danke.", "Perfect, thanks.", [["gracias"], ["perfecto"]]],
    ], [
      ["el aeropuerto", "der Flughafen", "airport", "✈️", "Un taxi al aeropuerto."],
      ["mañana", "morgen", "tomorrow", "🌅", "Mañana a las ocho."],
      ["ocho", "acht", "eight", "🕗", "A las ocho."],
    ]),
    day(2, 6, "💊", "In der Apotheke", "At the pharmacy", [
      ["Me duele la cabeza", "Me duele la cabeza", "Ich habe Kopfschmerzen.", "I have a headache.", "„Me duele …“ = mir tut … weh.", "“Me duele …” = my … hurts."],
      ["Me duele la cabeza desde ayer", "desde ayer", "Ich habe seit gestern Kopfschmerzen.", "I've had a headache since yesterday.", "„desde“ = seit.", "“desde” = since."],
      ["Me duele la cabeza desde ayer. ¿Tiene algo?", "¿Tiene algo?", "Ich habe seit gestern Kopfschmerzen. Haben Sie etwas?", "I've had a headache since yesterday. Do you have something?", "„¿Tiene…?“ = Haben Sie …?", "“¿Tiene…?” = Do you have …?"],
      ["Me duele la cabeza desde ayer. ¿Tiene algo para el dolor?", "para el dolor", "Ich habe seit gestern Kopfschmerzen. Haben Sie etwas gegen die Schmerzen?", "I've had a headache since yesterday. Do you have something for the pain?", "Spanisch sagt „für“ den Schmerz.", "Spanish says “for” the pain."],
    ], [
      ["¡Hola! ¿Qué le pasa?", "Hallo! Was fehlt Ihnen?", "Hello! What's the matter?", "Me duele la cabeza.", "Ich habe Kopfschmerzen.", "I have a headache.", [["me duele"]]],
      ["¿Desde cuándo?", "Seit wann?", "Since when?", "Desde ayer.", "Seit gestern.", "Since yesterday.", [["ayer"], ["desde"]]],
      ["¿Tiene fiebre?", "Haben Sie Fieber?", "Do you have a fever?", "No.", "Nein.", "No.", [["no"], ["si"]]],
      ["Entiendo.", "Ich verstehe.", "I see.", "¿Tiene algo para el dolor?", "Haben Sie etwas gegen die Schmerzen?", "Do you have something for the pain?", [["para el dolor"], ["tiene algo"]]],
    ], [
      ["la cabeza", "der Kopf", "head", "🤕", "Me duele la cabeza."],
      ["el dolor", "der Schmerz", "pain", "⚡", "Algo para el dolor."],
      ["la farmacia", "die Apotheke", "pharmacy", "💊", "Busco una farmacia."],
    ]),
    day(2, 7, "🤝", "Sich verabreden", "Making plans", [
      ["¿Quedamos mañana?", "¿Quedamos mañana?", "Treffen wir uns morgen?", "Shall we meet tomorrow?", "„¿Quedamos?“ = Treffen wir uns?", "“¿Quedamos?” = Shall we meet?"],
      ["¿Quedamos mañana a las ocho?", "a las ocho", "Treffen wir uns morgen um acht?", "Shall we meet tomorrow at eight?", "Die Uhrzeit kennst du vom Taxi.", "You know the time from the taxi."],
      ["¿Quedamos mañana a las ocho en el centro?", "en el centro", "Treffen wir uns morgen um acht im Zentrum?", "Shall we meet tomorrow at eight in the centre?", "„en el centro“ = im Zentrum.", "“en el centro” = in the centre."],
      ["¿Quedamos mañana a las ocho en el centro para cenar?", "para cenar", "Treffen wir uns morgen um acht im Zentrum zum Abendessen?", "Shall we meet tomorrow at eight in the centre for dinner?", "„para“ + Verb = um zu / zum.", "“para” + verb = (in order) to."],
    ], [
      ["¡Hola! ¿Qué haces mañana?", "Hallo! Was machst du morgen?", "Hi! What are you doing tomorrow?", "¿Quedamos mañana?", "Treffen wir uns morgen?", "Shall we meet tomorrow?", [["quedamos"]]],
      ["¡Vale! ¿A qué hora?", "Okay! Um wie viel Uhr?", "Okay! What time?", "A las ocho.", "Um acht.", "At eight.", [["a las"], ["ocho"]]],
      ["¿Dónde quedamos?", "Wo treffen wir uns?", "Where shall we meet?", "En el centro.", "Im Zentrum.", "In the centre.", [["centro"]]],
      ["¿Para tomar algo?", "Um etwas zu trinken?", "For a drink?", "Para cenar.", "Zum Abendessen.", "For dinner.", [["cenar"], ["si"]]],
    ], [
      ["quedar", "sich treffen", "to meet up", "🤝", "¿Quedamos mañana?"],
      ["el centro", "das Zentrum", "centre", "🏙️", "En el centro."],
      ["cenar", "zu Abend essen", "to have dinner", "🍽️", "Quedamos para cenar."],
    ]),
  ],
};
