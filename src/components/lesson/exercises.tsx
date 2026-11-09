import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { Lesson } from "../../lib/course";
import { assess, normalize, snapToVocabulary } from "../../lib/learning";
import { matchesSpokenPhrase } from "../../lib/oral-model";
import { shuffle, stripPunctuation, tilesCorrect } from "../../lib/exercises";
import type { Exercise } from "../../lib/exercises";
import { useI18n } from "../../lib/i18n";
import { usePreferences } from "../../lib/preferences";
import { useSay } from "../../lib/use-say";
import { Text } from "../localized-text";
import { OralPractice, Pill } from "../oral-practice";
import { Button, C, s } from "../ui";
import type { Result } from "./feedback-bar";
import { Speaker } from "./speaker";

type Props<K extends Exercise["kind"]> = { lesson: Lesson; ex: Extract<Exercise, { kind: K }>; locked: boolean; onResult: (r: Result) => void; noSpeech: boolean; onNoSpeech: () => void };
export function Prompt({ children }: { children: React.ReactNode }) {
  return <Text style={e.prompt}>{children}</Text>;
}
function CheckButton({ disabled, locked, onPress }: { disabled: boolean; locked: boolean; onPress: () => void }) {
  if (locked) return null;
  return <Button disabled={disabled} onPress={onPress}>Prüfen</Button>;
}

// 1 · Hear and repeat (text hidden until wanted)
export function SpeakExercise({ lesson, ex, locked, onResult, onNoSpeech }: Props<"speak">) {
  const p = lesson.phrases[ex.phrase];
  const [show, setShow] = useState(false);
  return <View style={e.body}>
    <Prompt>Hör zu und sprich nach</Prompt>
    <View style={e.card}>
      <Text style={e.meaning}>{p.de}</Text>
      {show ? <Text translate={false} style={e.target}>{p.phrase}</Text> : <Text accessible={false} style={{ fontSize: 34 }}>🎧</Text>}
    </View>
    {!locked && <OralPractice prompt={p.phrase} repeat expected={[p.phrase]} accept={(t) => matchesSpokenPhrase(t, p.phrase)}
      onAnswer={(heard) => onResult({ ok: matchesSpokenPhrase(heard, p.phrase), solution: p.phrase, heard })}
      actions={<>
        <Pill icon="👁" label={show ? "Verbergen" : "Text"} active={show} onPress={() => setShow((v) => !v)} />
        <Pill icon="🔇" label="Später" onPress={onNoSpeech} />
      </>} />}
  </View>;
}

// 2 · Read: rebuild the sentence from word tiles
export function TilesExercise({ lesson, ex, locked, onResult }: Props<"tiles">) {
  const p = lesson.phrases[ex.phrase];
  const [chosen, setChosen] = useState<number[]>([]);
  return <View style={e.body}>
    <Prompt>Hör zu und setze den Satz zusammen</Prompt>
    <Speaker text={p.phrase} />
    <Text style={[s.small, s.center]}>{p.de}</Text>
    <View style={e.answer}>
      {chosen.map((i) => <Pressable key={i} disabled={locked} accessibilityRole="button" onPress={() => setChosen((c) => c.filter((x) => x !== i))} style={e.tile}>
        <Text translate={false} style={e.tileText}>{ex.tiles[i]}</Text>
      </Pressable>)}
    </View>
    <View style={e.bank}>
      {ex.tiles.map((word, i) => {
        const used = chosen.includes(i);
        return <Pressable key={i} disabled={used || locked} accessibilityRole="button" accessibilityState={{ disabled: used }}
          onPress={() => setChosen((c) => [...c, i])} style={[e.tile, used && e.tileUsed]}>
          <Text translate={false} style={[e.tileText, used && { color: "transparent" }]}>{word}</Text>
        </Pressable>;
      })}
    </View>
    <CheckButton locked={locked} disabled={!chosen.length} onPress={() => onResult({ ok: tilesCorrect(chosen.map((i) => ex.tiles[i]), p.phrase), solution: p.phrase, note: p.tip })} />
  </View>;
}

// 3 · Write the sentence (one-letter typos per word are forgiven, with a note)
export function WriteExercise({ lesson, ex, locked, onResult }: Props<"write">) {
  const { t } = useI18n();
  const p = lesson.phrases[ex.phrase];
  const [text, setText] = useState("");
  function check() {
    const exact = normalize(text) === normalize(p.phrase);
    const close = !exact && snapToVocabulary(text, [p.phrase]) === normalize(p.phrase);
    onResult({ ok: exact || close, solution: p.phrase, note: close ? `Kleiner Tippfehler – achte auf die Schreibweise:\n${p.phrase}` : undefined });
  }
  return <View style={e.body}>
    <Prompt>Schreibe auf Spanisch</Prompt>
    <View style={e.card}><Text style={e.target}>{p.de}</Text></View>
    <TextInput value={text} onChangeText={setText} editable={!locked} accessibilityLabel={t("Den Satz auf Spanisch schreiben")}
      placeholder={t("Auf Spanisch schreiben …")} placeholderTextColor={C.muted} style={e.input} multiline maxLength={300}
      autoCorrect={false} autoCapitalize="sentences" />
    <CheckButton locked={locked} disabled={!text.trim()} onPress={check} />
  </View>;
}

// Words · tap matching pairs (Spanish word is spoken when tapped)
export function MatchExercise({ lesson, ex, locked, onResult }: Props<"match">) {
  const say = useSay();
  const left = useMemo(() => shuffle(ex.words, lesson.id + 3), [ex.words, lesson.id]);
  const right = useMemo(() => shuffle(ex.words, lesson.id + 11), [ex.words, lesson.id]);
  const [pickL, setPickL] = useState<number | null>(null);
  const [pickR, setPickR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  function choose(side: "l" | "r", w: number) {
    const l = side === "l" ? w : pickL, r = side === "r" ? w : pickR;
    if (side === "l") { setPickL(w); void say(lesson.words[w].es); } else setPickR(w);
    if (l === null || r === null) return;
    if (l === r) {
      const next = [...done, l]; setDone(next); setPickL(null); setPickR(null); setWrong(false);
      if (next.length === ex.words.length) setTimeout(() => onResult({ ok: true }), 300);
    } else { setWrong(true); setPickL(null); setPickR(null); }
  }
  const Cell = ({ w, side }: { w: number; side: "l" | "r" }) => {
    const matched = done.includes(w);
    const picked = (side === "l" ? pickL : pickR) === w;
    return <Pressable disabled={matched || locked} accessibilityRole="button" onPress={() => choose(side, w)} style={[e.pair, picked && e.pairPicked, matched && e.pairDone]}>
      <Text translate={side === "r"} style={[e.tileText, matched && { color: C.muted }]}>{side === "l" ? `${lesson.words[w].symbol} ${lesson.words[w].es}` : lesson.words[w].de}</Text>
    </Pressable>;
  };
  return <View style={e.body}>
    <Prompt>Finde die Paare</Prompt>
    <View style={{ flexDirection: "row", gap: 10 }}>
      <View style={{ flex: 1, gap: 10 }}>{left.map((w) => <Cell key={w} w={w} side="l" />)}</View>
      <View style={{ flex: 1, gap: 10 }}>{right.map((w) => <Cell key={w} w={w} side="r" />)}</View>
    </View>
    {wrong && <Text style={[s.body, s.center]}>Das passt noch nicht – versuch ein anderes Paar.</Text>}
  </View>;
}

// Dialogue with Lucía/Mateo: speak (or type) the answer, word blocks as support
export function DialogExercise({ lesson, ex, locked, onResult, noSpeech }: Props<"dialog">) {
  const { t } = useI18n();
  const { preferences } = usePreferences();
  const turn = lesson.turns[ex.turn];
  const [typing, setTyping] = useState(noSpeech);
  const [hint, setHint] = useState(false);
  const [reply, setReply] = useState("");
  const blocks = useMemo(() => stripPunctuation(turn.hint).split(" ").sort((a, b) => a.localeCompare(b, "es")), [turn.hint]);
  function answer(text: string) {
    const r = assess(text, ex.turn, lesson.turns);
    onResult({ ok: r.ok, solution: turn.hint, note: r.message.replace(/^¡[^!]*!\s*/, ""), heard: text });
  }
  return <View style={e.body}>
    <Prompt>Antworte {preferences.voiceGender === "male" ? "Mateo" : "Lucía"}</Prompt>
    <View style={[s.row, { alignItems: "flex-start" }]}>
      <View style={e.avatar}><Text accessible={false} style={{ fontSize: 26 }}>{preferences.voiceGender === "male" ? "👨🏽" : "👩🏽"}</Text></View>
      <View style={e.bubble}>
        <Text translate={false} style={e.bubbleEs}>{turn.es}</Text>
        <Text style={s.small}>{turn.de}</Text>
      </View>
    </View>
    {hint ? <View style={[e.card, { backgroundColor: C.yellow }]}><Text translate={false} style={e.target}>{turn.hint}</Text></View>
      : <View style={e.blocks}>{blocks.map((w, i) => <View key={`${w}-${i}`} style={e.block}><Text translate={false} style={e.blockText}>{w}</Text></View>)}</View>}
    {!locked && !typing && <OralPractice prompt={turn.es} onAnswer={answer} expected={[turn.hint, ...lesson.phrases.map((x) => x.phrase)]}
      accept={(text) => assess(text, ex.turn, lesson.turns).ok}
      actions={<>
        <Pill icon="⌨" label="Tippen" onPress={() => setTyping(true)} />
        <Pill icon="💡" label="Hilfe" active={hint} onPress={() => setHint((v) => !v)} />
      </>} />}
    {!locked && typing && <>
      {!noSpeech && <Speaker text={turn.es} auto={false} size={56} />}
      <TextInput value={reply} onChangeText={setReply} accessibilityLabel={t("Deine Antwort auf Spanisch")} placeholder={t("Deine Antwort auf Spanisch …")}
        placeholderTextColor={C.muted} style={e.input} multiline maxLength={300} autoCorrect={false} autoCapitalize="sentences" />
      <View style={s.row}>
        <Pill icon="💡" label="Hilfe" active={hint} onPress={() => setHint((v) => !v)} />
        {!noSpeech && <Pill icon="🎙" label="Sprechen" onPress={() => setTyping(false)} />}
      </View>
      <CheckButton locked={locked} disabled={!reply.trim()} onPress={() => answer(reply)} />
    </>}
  </View>;
}

// Words · end-of-day check: choose the meaning
export function WordExercise({ lesson, ex, locked, onResult }: Props<"word">) {
  const w = lesson.words[ex.word];
  const [pick, setPick] = useState<string | null>(null);
  return <View style={e.body}>
    <Prompt>Was bedeutet das?</Prompt>
    <View style={e.card}>
      <Text accessible={false} style={{ fontSize: 46 }}>{w.symbol}</Text>
      <Text translate={false} style={e.target}>{w.es}</Text>
    </View>
    <Speaker text={w.es} size={56} />
    {ex.options.map((o) => <Pressable key={o} disabled={locked} accessibilityRole="radio" accessibilityState={{ checked: pick === o }}
      onPress={() => setPick(o)} style={[e.option, pick === o && e.optionPicked]}>
      <Text style={[e.tileText, { textAlign: "center" }]}>{o}</Text>
    </Pressable>)}
    <CheckButton locked={locked} disabled={!pick} onPress={() => onResult({ ok: pick === w.de, solution: w.de, note: `${w.es} – ${w.example}` })} />
  </View>;
}

const e = StyleSheet.create({
  body: { gap: 16 },
  prompt: { fontSize: 20, fontWeight: "700", color: C.green, letterSpacing: -0.4 },
  card: { backgroundColor: C.pale, borderRadius: 18, padding: 20, gap: 8, alignItems: "center" },
  meaning: { fontSize: 15, color: C.muted, textAlign: "center" },
  target: { fontSize: 24, fontWeight: "700", color: C.green, textAlign: "center", letterSpacing: -0.4 },
  answer: { minHeight: 64, borderBottomWidth: 1, borderColor: C.line, flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 8 },
  bank: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tile: { borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  tileUsed: { backgroundColor: C.line, borderColor: C.line },
  tileText: { fontSize: 17, color: C.green, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 16, fontSize: 18, color: C.green, minHeight: 110, textAlignVertical: "top", backgroundColor: C.paper },
  pair: { borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, minHeight: 56, justifyContent: "center", backgroundColor: C.paper },
  pairPicked: { borderColor: C.green, backgroundColor: C.pale },
  pairDone: { opacity: 0.4 },
  option: { borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 16, backgroundColor: C.paper },
  optionPicked: { borderColor: C.green, backgroundColor: C.pale },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#dfc8a8", alignItems: "center", justifyContent: "center" },
  bubble: { flex: 1, backgroundColor: C.pale, borderRadius: 16, borderTopLeftRadius: 4, padding: 16, gap: 6 },
  bubbleEs: { fontSize: 20, fontWeight: "700", color: C.green },
  blocks: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
  block: { borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  blockText: { fontSize: 15, color: C.green, fontWeight: "600" },
});
