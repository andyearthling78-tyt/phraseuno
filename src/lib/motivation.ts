export const motivations = [
  { es: "Recuerda por qué empezaste. Cada palabra te acerca un poco más.", de: "Erinnere dich daran, warum du angefangen hast. Jedes Wort bringt dich ein Stück näher." },
  { es: "Aprende con calma, a tu propio ritmo.", de: "Lerne ganz entspannt, in deinem eigenen Tempo." },
  { es: "Un nuevo idioma es como un nuevo amor: crece con el tiempo.", de: "Eine neue Sprache ist wie eine neue Liebe: Sie wächst mit der Zeit." },
  { es: "No necesitas hacerlo perfecto. Solo necesitas dar el primer paso.", de: "Du musst es nicht perfekt machen. Du darfst einfach den ersten Schritt gehen." },
  { es: "Una frase pequeña puede abrir una puerta muy grande.", de: "Ein kleiner Satz kann eine große Tür öffnen." },
  { es: "Hoy no tienes que saberlo todo. Basta con descubrir algo nuevo.", de: "Heute musst du nicht alles wissen. Es reicht, etwas Neues zu entdecken." },
  { es: "Cada intento cuenta. Incluso los que empiezan con una sonrisa y un error.", de: "Jeder Versuch zählt. Auch die, die mit einem Lächeln und einem Fehler beginnen." },
  { es: "Tu curiosidad es más importante que tu perfección.", de: "Deine Neugier ist wichtiger als deine Perfektion." },
];
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dailyMotivation(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return motivations[((day % motivations.length) + motivations.length) % motivations.length];
}
