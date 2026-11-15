import type { Week } from "../../domain/types.ts";
import { day } from "./build.ts";
// Week 1 (free): first everyday sentences. Each phrase grows by one chunk per step.
export const week1: Week = {
  id: 1,
  title: { de: "Erste Sätze für den Alltag", en: "First everyday sentences" },
  days: [
    day(1, 1, "☕", "Im Café", "At the café", [
      ["Quiero un café", "Quiero un café", "Ich möchte einen Kaffee.", "I'd like a coffee.", "„Quiero“ = ich möchte. Damit bestellst du fast alles.", "“Quiero” = I'd like. It works for ordering almost anything."],
      ["Quiero un café con leche", "con leche", "Ich möchte einen Kaffee mit Milch.", "I'd like a coffee with milk.", "„con“ = mit.", "“con” = with."],
      ["Quiero un café con leche, por favor", "por favor", "Ich möchte einen Kaffee mit Milch, bitte.", "I'd like a coffee with milk, please.", "„por favor“ gehört immer zusammen.", "“por favor” always goes together."],
      ["Quiero un café con leche, por favor, para llevar", "para llevar", "Ich möchte einen Kaffee mit Milch, bitte, zum Mitnehmen.", "I'd like a coffee with milk, please, to go.", "„para llevar“ = zum Mitnehmen. Lerne es als Ganzes.", "“para llevar” = to go. Learn it as one piece."],
    ], [
      ["¡Hola! ¿Qué quieres tomar?", "Hallo! Was möchtest du trinken?", "Hi! What would you like to drink?", "Quiero un café.", "Ich möchte einen Kaffee.", "I'd like a coffee.", [["quiero", "cafe"]], ["no quiero"]],
      ["¿Solo o con leche?", "Schwarz oder mit Milch?", "Black or with milk?", "Con leche, por favor.", "Mit Milch, bitte.", "With milk, please.", [["con leche"], ["solo"]], ["sin leche"]],
      ["¿Para tomar aquí o para llevar?", "Hier trinken oder zum Mitnehmen?", "For here or to go?", "Para llevar, por favor.", "Zum Mitnehmen, bitte.", "To go, please.", [["para llevar"], ["aqui"]]],
      ["¿Puedes repetir tu pedido?", "Kannst du deine Bestellung wiederholen?", "Can you repeat your order?", "Quiero un café con leche, por favor, para llevar.", "Ich möchte einen Kaffee mit Milch, bitte, zum Mitnehmen.", "I'd like a coffee with milk, please, to go.", [["quiero", "cafe", "con leche", "para llevar"]], ["no quiero", "sin leche"]],
    ], [
      ["el café", "der Kaffee", "coffee", "☕", "Quiero un café."],
      ["la leche", "die Milch", "milk", "🥛", "Un café con leche."],
      ["llevar", "mitnehmen", "to take away", "🥡", "Para llevar, por favor."],
    ]),
    day(1, 2, "🥖", "In der Bäckerei", "At the bakery", [
      ["Quiero pan", "Quiero pan", "Ich möchte Brot.", "I'd like bread.", "Ohne Artikel: einfach „pan“.", "No article needed: just “pan”."],
      ["Quiero pan y un cruasán", "y un cruasán", "Ich möchte Brot und ein Croissant.", "I'd like bread and a croissant.", "„y“ = und.", "“y” = and."],
      ["Quiero pan y un cruasán, por favor", "por favor", "Ich möchte Brot und ein Croissant, bitte.", "I'd like bread and a croissant, please.", "Höflich klingt es sofort freundlicher.", "Politeness makes it friendlier right away."],
      ["Quiero pan y un cruasán, por favor. ¿Cuánto es?", "¿Cuánto es?", "Ich möchte Brot und ein Croissant, bitte. Wie viel macht das?", "I'd like bread and a croissant, please. How much is it?", "„¿Cuánto es?“ fragst du an jeder Kasse.", "You can ask “¿Cuánto es?” at any till."],
    ], [
      ["¡Buenos días! ¿Qué quieres?", "Guten Morgen! Was möchtest du?", "Good morning! What would you like?", "Quiero pan.", "Ich möchte Brot.", "I'd like bread.", [["quiero", "pan"]], ["no quiero"]],
      ["¿Algo más?", "Noch etwas?", "Anything else?", "Y un cruasán, por favor.", "Und ein Croissant, bitte.", "And a croissant, please.", [["cruasan"]]],
      ["¿Quieres una bolsa?", "Möchtest du eine Tüte?", "Would you like a bag?", "Sí, por favor.", "Ja, bitte.", "Yes, please.", [["si"], ["no"]]],
      ["Aquí tienes.", "Bitte schön.", "Here you are.", "¿Cuánto es?", "Wie viel macht das?", "How much is it?", [["cuanto es"], ["cuanto cuesta"]]],
    ], [
      ["el pan", "das Brot", "bread", "🍞", "Quiero pan."],
      ["el cruasán", "das Croissant", "croissant", "🥐", "Un cruasán, por favor."],
      ["la bolsa", "die Tüte", "bag", "🛍️", "¿Quieres una bolsa?"],
    ]),
    day(1, 3, "🍽️", "Im Restaurant", "At the restaurant", [
      ["Quiero una mesa", "Quiero una mesa", "Ich möchte einen Tisch.", "I'd like a table.", "„una“ = eine. „mesa“ ist weiblich.", "“una” = a. “mesa” is feminine."],
      ["Quiero una mesa para dos", "para dos", "Ich möchte einen Tisch für zwei.", "I'd like a table for two.", "„para“ = für.", "“para” = for."],
      ["Quiero una mesa para dos en la terraza", "en la terraza", "Ich möchte einen Tisch für zwei auf der Terrasse.", "I'd like a table for two on the terrace.", "„en“ = in, auf, an.", "“en” = in, on, at."],
      ["Quiero una mesa para dos en la terraza, por favor", "por favor", "Ich möchte einen Tisch für zwei auf der Terrasse, bitte.", "I'd like a table for two on the terrace, please.", "Ein langer Satz – aus vier kleinen Teilen.", "A long sentence – made of four small parts."],
    ], [
      ["¡Hola! ¿Qué desean?", "Hallo! Was wünschen Sie?", "Hello! What would you like?", "Quiero una mesa, por favor.", "Ich möchte einen Tisch, bitte.", "I'd like a table, please.", [["una mesa"]], ["no quiero"]],
      ["¿Para cuántas personas?", "Für wie viele Personen?", "For how many people?", "Para dos.", "Für zwei.", "For two.", [["dos"]]],
      ["¿Dentro o en la terraza?", "Drinnen oder auf der Terrasse?", "Inside or on the terrace?", "En la terraza, por favor.", "Auf der Terrasse, bitte.", "On the terrace, please.", [["terraza"], ["dentro"]]],
      ["Perdón, ¿puede repetir?", "Entschuldigung, können Sie das wiederholen?", "Sorry, could you repeat that?", "Quiero una mesa para dos en la terraza, por favor.", "Ich möchte einen Tisch für zwei auf der Terrasse, bitte.", "I'd like a table for two on the terrace, please.", [["mesa", "para dos", "terraza"]]],
    ], [
      ["la mesa", "der Tisch", "table", "🪑", "Quiero una mesa."],
      ["dos", "zwei", "two", "✌️", "Una mesa para dos."],
      ["la terraza", "die Terrasse", "terrace", "☀️", "En la terraza, por favor."],
    ]),
    day(1, 4, "📍", "Unterwegs", "Getting around", [
      ["Busco la estación", "Busco la estación", "Ich suche den Bahnhof.", "I'm looking for the station.", "„Busco“ = ich suche.", "“Busco” = I'm looking for."],
      ["Busco la estación de tren", "de tren", "Ich suche den Bahnhof (Zugbahnhof).", "I'm looking for the train station.", "„de“ verbindet: Station „vom“ Zug.", "“de” links things: station “of” the train."],
      ["Busco la estación de tren. ¿Está cerca?", "¿Está cerca?", "Ich suche den Bahnhof. Ist er in der Nähe?", "I'm looking for the train station. Is it nearby?", "„¿Está…?“ = Ist es …?", "“¿Está…?” = Is it …?"],
      ["Busco la estación de tren. ¿Está cerca de aquí?", "de aquí", "Ich suche den Bahnhof. Ist er hier in der Nähe?", "I'm looking for the train station. Is it near here?", "„aquí“ = hier.", "“aquí” = here."],
    ], [
      ["¡Hola! ¿Necesitas ayuda?", "Hallo! Brauchst du Hilfe?", "Hi! Do you need help?", "Sí, busco la estación.", "Ja, ich suche den Bahnhof.", "Yes, I'm looking for the station.", [["busco", "estacion"]]],
      ["¿La estación de tren o de autobús?", "Den Zug- oder den Busbahnhof?", "The train station or the bus station?", "La estación de tren.", "Den Zugbahnhof.", "The train station.", [["tren"]], ["autobus"]],
      ["La estación está en el centro.", "Der Bahnhof ist im Zentrum.", "The station is in the centre.", "¿Está cerca de aquí?", "Ist er hier in der Nähe?", "Is it near here?", [["cerca"]]],
      ["Sí, está muy cerca. A la derecha.", "Ja, ganz in der Nähe. Rechts.", "Yes, very close. On the right.", "Muchas gracias.", "Vielen Dank.", "Thank you very much.", [["gracias"]]],
    ], [
      ["la estación", "der Bahnhof", "station", "🚉", "Busco la estación."],
      ["el tren", "der Zug", "train", "🚆", "La estación de tren."],
      ["cerca", "in der Nähe", "nearby", "📍", "¿Está cerca de aquí?"],
    ]),
    day(1, 5, "🍎", "Auf dem Markt", "At the market", [
      ["¿Cuánto cuesta?", "¿Cuánto cuesta?", "Wie viel kostet das?", "How much does it cost?", "Die wichtigste Frage beim Einkaufen.", "The most useful question when shopping."],
      ["¿Cuánto cuesta un kilo?", "un kilo", "Wie viel kostet ein Kilo?", "How much is a kilo?", "„un kilo“ – wie im Deutschen.", "“un kilo” – one kilo."],
      ["¿Cuánto cuesta un kilo de manzanas?", "de manzanas", "Wie viel kostet ein Kilo Äpfel?", "How much is a kilo of apples?", "Menge + „de“ + Ware.", "Amount + “de” + item."],
      ["¿Cuánto cuesta un kilo de manzanas y tomates?", "y tomates", "Wie viel kostet ein Kilo Äpfel und Tomaten?", "How much is a kilo of apples and tomatoes?", "Mit „y“ hängst du einfach an.", "Just add more with “y”."],
    ], [
      ["¡Hola! ¿Qué quieres?", "Hallo! Was möchtest du?", "Hi! What would you like?", "Quiero manzanas.", "Ich möchte Äpfel.", "I'd like apples.", [["manzanas"], ["manzana"]], ["no quiero"]],
      ["¿Cuántas quieres?", "Wie viele möchtest du?", "How many would you like?", "Un kilo, por favor.", "Ein Kilo, bitte.", "One kilo, please.", [["kilo"]]],
      ["¿Algo más?", "Noch etwas?", "Anything else?", "¿Cuánto cuesta un kilo de tomates?", "Wie viel kostet ein Kilo Tomaten?", "How much is a kilo of tomatoes?", [["cuanto", "tomates"]]],
      ["Dos euros el kilo.", "Zwei Euro das Kilo.", "Two euros a kilo.", "Vale, un kilo, por favor.", "Okay, ein Kilo, bitte.", "Okay, one kilo, please.", [["kilo"]]],
    ], [
      ["el kilo", "das Kilo", "kilo", "⚖️", "Un kilo, por favor."],
      ["la manzana", "der Apfel", "apple", "🍎", "Un kilo de manzanas."],
      ["el tomate", "die Tomate", "tomato", "🍅", "¿Cuánto cuesta un kilo de tomates?"],
    ]),
    day(1, 6, "🛏️", "Im Hotel", "At the hotel", [
      ["Tengo una reserva", "Tengo una reserva", "Ich habe eine Reservierung.", "I have a reservation.", "„Tengo“ = ich habe.", "“Tengo” = I have."],
      ["Tengo una reserva para dos noches", "para dos noches", "Ich habe eine Reservierung für zwei Nächte.", "I have a reservation for two nights.", "„para“ kennst du schon: für.", "You already know “para”: for."],
      ["Tengo una reserva para dos noches a nombre de Ana", "a nombre de Ana", "Ich habe eine Reservierung für zwei Nächte auf den Namen Ana.", "I have a reservation for two nights under the name Ana.", "„a nombre de …“ + dein Name.", "“a nombre de …” + your name."],
      ["Buenas tardes. Tengo una reserva para dos noches a nombre de Ana", "Buenas tardes", "Guten Tag. Ich habe eine Reservierung für zwei Nächte auf den Namen Ana.", "Good afternoon. I have a reservation for two nights under the name Ana.", "„Buenas tardes“ sagst du ab dem Mittag.", "Say “Buenas tardes” from midday on."],
    ], [
      ["¡Buenas tardes! ¿En qué puedo ayudarle?", "Guten Tag! Wie kann ich Ihnen helfen?", "Good afternoon! How can I help you?", "Tengo una reserva.", "Ich habe eine Reservierung.", "I have a reservation.", [["tengo", "reserva"]]],
      ["¿A qué nombre?", "Auf welchen Namen?", "Under what name?", "A nombre de Ana.", "Auf den Namen Ana.", "Under the name Ana.", [["nombre de"], ["ana"]]],
      ["¿Para cuántas noches?", "Für wie viele Nächte?", "For how many nights?", "Para dos noches.", "Für zwei Nächte.", "For two nights.", [["noches"], ["dos"]]],
      ["Perfecto. Su habitación es la doce.", "Perfekt. Ihr Zimmer ist die Zwölf.", "Perfect. Your room is number twelve.", "Muchas gracias.", "Vielen Dank.", "Thank you very much.", [["gracias"]]],
    ], [
      ["la reserva", "die Reservierung", "reservation", "📋", "Tengo una reserva."],
      ["la noche", "die Nacht", "night", "🌙", "Para dos noches."],
      ["la habitación", "das Zimmer", "room", "🛏️", "Su habitación es la doce."],
    ]),
    day(1, 7, "💬", "Nachfragen", "Asking again", [
      ["No entiendo", "No entiendo", "Ich verstehe nicht.", "I don't understand.", "„No“ steht vor dem Verb.", "“No” goes before the verb."],
      ["No entiendo. ¿Puedes repetir?", "¿Puedes repetir?", "Ich verstehe nicht. Kannst du das wiederholen?", "I don't understand. Can you repeat that?", "„¿Puedes…?“ = Kannst du …?", "“¿Puedes…?” = Can you …?"],
      ["No entiendo. ¿Puedes repetir más despacio?", "más despacio", "Ich verstehe nicht. Kannst du das langsamer wiederholen?", "I don't understand. Can you repeat that more slowly?", "„más“ = mehr; „más despacio“ = langsamer.", "“más” = more; “más despacio” = more slowly."],
      ["No entiendo. ¿Puedes repetir más despacio, por favor?", "por favor", "Ich verstehe nicht. Kannst du das bitte langsamer wiederholen?", "I don't understand. Can you repeat that more slowly, please?", "Dein Rettungssatz für jedes Gespräch.", "Your rescue sentence for any conversation."],
    ], [
      ["¿De dónde eres y qué haces aquí?", "Woher kommst du und was machst du hier?", "Where are you from and what are you doing here?", "No entiendo.", "Ich verstehe nicht.", "I don't understand.", [["no entiendo"]]],
      ["¿Hablas español?", "Sprichst du Spanisch?", "Do you speak Spanish?", "Un poco.", "Ein bisschen.", "A little.", [["poco"], ["si"]]],
      ["Entonces hablamos en español, ¿vale?", "Dann sprechen wir Spanisch, okay?", "Then let's speak Spanish, okay?", "¿Puedes repetir más despacio?", "Kannst du das langsamer wiederholen?", "Can you repeat that more slowly?", [["repetir"], ["mas despacio"]]],
      ["Claro. Hablamos… en… español.", "Klar. Wir sprechen … Spanisch.", "Sure. Let's speak … Spanish.", "Gracias.", "Danke.", "Thank you.", [["gracias"], ["vale"]]],
    ], [
      ["repetir", "wiederholen", "to repeat", "🔁", "¿Puedes repetir?"],
      ["despacio", "langsam", "slowly", "🐌", "Más despacio, por favor."],
      ["entender", "verstehen", "to understand", "💡", "No entiendo."],
    ]),
  ],
};
