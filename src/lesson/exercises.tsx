import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { tutorName } from "../domain/prefs";
import { shuffle } from "../domain/session";
import type { Exercise } from "../domain/session";
import { judgePhrase, judgeTurn, matchesPhrase, stripPunctuation, tilesCorrect } from "../domain/text";
import { findDay, resolveItem } from "../domain/types";
import { useApp } from "../state/app";
import { Button, k, Pill, Row, T } from "../ui/kit";
import { theme } from "../ui/theme";
import { OralInput, Speaker } from "./parts";
import type { Result } from "./parts";
import { useSay } from "./voice";

type Shared = { locked: boolean; onResult: (result: Result) => void; noSpeech: boolean; onNoSpeech: () => void };
type Props<K extends Exercise["kind"]> = Shared & { ex: Extract<Exercise, { kind: K }> };
const Check = ({ locked, disabled, onPress, label }: { locked: boolean; disabled: boolean; onPress: () => void; label: string }) =>
  locked ? null : <Button disabled={disabled} onPress={onPress}>{label}</Button>;
function usePhrase(item: string) {
  const { course } = useApp();
  const found = resolveItem(course, item);
  if (found?.kind !== "phrase") throw new Error(`Unknown phrase item ${item}`);
  return found.chunk;
}
function mustFindDay(course: Parameters<typeof findDay>[0], id: string) {
  const day = findDay(course, id);
  if (!day) throw new Error(`Unknown day ${id}`);
  return day;
}
/** Shows the phrase with its newest part highlighted. */
function Grown({ es, add }: { es: string; add: string }) {
  const at = es.lastIndexOf(add);
  if (at < 0 || add === es) return <T es center style={e.target}>{es}</T>;
  return <T es center style={e.target}>{es.slice(0, at)}<T es style={[e.target, { backgroundColor: theme.yellow }]}>{add}</T>{es.slice(at + add.length)}</T>;
}

// Hear the phrase and repeat it aloud. Text stays hidden unless wanted.
export function Listen({ ex, locked, onResult, onNoSpeech }: Props<"listen">) {
  const { t, l } = useApp();
  const chunk = usePhrase(ex.item);
  const [show, setShow] = useState(false);
  return <View style={e.body}>
    <T v="h2">{t("ex.listen")}</T>
    <View style={e.card}>
      <T center style={e.meaning}>{l(chunk.meaning)}</T>
      {show ? <Grown es={chunk.es} add={chunk.add} /> : <T accessible={false} style={{ fontSize: 32 }}>🎧</T>}
    </View>
    {!locked && <OralInput prompt={chunk.es} idleKey="mic.repeat" expected={[chunk.es]} accept={(text) => matchesPhrase(text, chunk.es)}
      onAnswer={(heard) => onResult({ ok: matchesPhrase(heard, chunk.es), solution: chunk.es, heard })}
      actions={<>
        <Pill icon="👁" label={t(show ? "btn.hide" : "btn.text")} active={show} onPress={() => setShow((v) => !v)} />
        <Pill icon="🔇" label={t("btn.later")} onPress={onNoSpeech} />
      </>} />}
  </View>;
}
// Read: assemble the phrase from word tiles (with audio in lessons, from meaning in reviews).
export function Build({ ex, locked, onResult }: Props<"build">) {
  const { t, l } = useApp();
  const chunk = usePhrase(ex.item);
  const [chosen, setChosen] = useState<number[]>([]);
  return <View style={e.body}>
    <T v="h2">{t(ex.audio ? "ex.buildAudio" : "ex.build")}</T>
    {ex.audio && <Speaker text={chunk.es} />}
    <View style={e.card}><T center style={ex.audio ? e.meaning : e.target}>{l(chunk.meaning)}</T></View>
    <View style={e.answer}>
      {chosen.map((i) => <Pressable key={i} disabled={locked} accessibilityRole="button" onPress={() => setChosen((c) => c.filter((x) => x !== i))} style={e.tile}>
        <T es style={e.tileText}>{ex.tiles[i]}</T>
      </Pressable>)}
    </View>
    <View style={e.bank}>
      {ex.tiles.map((word, i) => {
        const used = chosen.includes(i);
        return <Pressable key={i} disabled={used || locked} accessibilityRole="button" accessibilityState={{ disabled: used }}
          onPress={() => setChosen((c) => [...c, i])} style={[e.tile, used && { backgroundColor: theme.line }]}>
          <T es style={[e.tileText, used && { color: "transparent" }]}>{word}</T>
        </Pressable>;
      })}
    </View>
    <Check locked={locked} disabled={!chosen.length} label={t("common.check")}
      onPress={() => onResult({ ok: tilesCorrect(chosen.map((i) => ex.tiles[i]), stripPunctuation(chunk.es)), solution: chunk.es, note: l(chunk.tip) })} />
  </View>;
}
// Write the phrase from its meaning. One-letter slips per word pass, with a spelling note.
export function Write({ ex, locked, onResult }: Props<"write">) {
  const { t, l } = useApp();
  const chunk = usePhrase(ex.item);
  const [text, setText] = useState("");
  function check() {
    const verdict = judgePhrase(text, chunk.es);
    onResult({ ok: verdict !== "wrong", solution: chunk.es, note: verdict === "close" ? `${t("fb.typo")}\n${chunk.es}` : undefined });
  }
  return <View style={e.body}>
    <T v="h2">{t("ex.write")}</T>
    <View style={e.card}><T center style={e.target}>{l(chunk.meaning)}</T></View>
    <TextInput value={text} onChangeText={setText} editable={!locked} accessibilityLabel={t("ex.write")} placeholder={t("write.placeholder")}
      placeholderTextColor={theme.muted} style={e.input} multiline maxLength={300} autoCorrect={false} autoCapitalize="sentences" />
    <Check locked={locked} disabled={!text.trim()} label={t("common.check")} onPress={check} />
  </View>;
}
// Review: say the phrase from memory (typed when speaking is off).
export function Recall({ ex, locked, onResult, noSpeech, onNoSpeech }: Props<"recall">) {
  const { t, l } = useApp();
  const chunk = usePhrase(ex.item);
  const [text, setText] = useState("");
  const answer = (input: string, heard: boolean) => onResult({ ok: matchesPhrase(input, chunk.es), solution: chunk.es, heard: heard ? input : undefined });
  return <View style={e.body}>
    <T v="h2">{t(noSpeech ? "ex.write" : "ex.recall")}</T>
    <View style={e.card}><T center style={e.target}>{l(chunk.meaning)}</T></View>
    {!locked && !noSpeech && <OralInput idleKey="mic.recall" expected={[chunk.es]} accept={(input) => matchesPhrase(input, chunk.es)} onAnswer={(input) => answer(input, true)}
      actions={<Pill icon="⌨" label={t("btn.type")} onPress={onNoSpeech} />} />}
    {noSpeech && <>
      <TextInput value={text} onChangeText={setText} editable={!locked} accessibilityLabel={t("ex.write")} placeholder={t("write.placeholder")}
        placeholderTextColor={theme.muted} style={e.input} multiline maxLength={300} autoCorrect={false} autoCapitalize="sentences" />
      <Check locked={locked} disabled={!text.trim()} label={t("common.check")} onPress={() => answer(text, false)} />
    </>}
  </View>;
}
// Dialogue with the tutor: speak or type; the model answer's words are shown as unordered support.
export function Dialog({ ex, locked, onResult, noSpeech }: Props<"dialog">) {
  const { t, l, course, prefs } = useApp();
  const day = mustFindDay(course, ex.day);
  const turn = day.turns[ex.turn];
  const vocabulary = useMemo(() => day.chunks.map((chunk) => chunk.es), [day]);
  const [typing, setTyping] = useState(noSpeech);
  const [help, setHelp] = useState(false);
  const [reply, setReply] = useState("");
  const blocks = useMemo(() => stripPunctuation(turn.answer).split(" ").sort((a, b) => a.localeCompare(b, "es")), [turn.answer]);
  const expected = useMemo(() => [turn.answer, ...vocabulary], [turn.answer, vocabulary]);
  const answer = (text: string) => onResult({ ok: judgeTurn(text, turn, vocabulary), solution: turn.answer, meaning: l(turn.answerMeaning), heard: text });
  const male = prefs.voice === "male";
  return <View style={e.body}>
    <T v="h2">{t("ex.dialog", { name: tutorName(prefs.voice) })}</T>
    <Row style={{ alignItems: "flex-start" }}>
      <View style={e.avatar}><T accessible={false} style={{ fontSize: 26 }}>{male ? "👨🏽" : "👩🏽"}</T></View>
      <View style={e.bubble}>
        <T es style={e.bubbleEs}>{turn.es}</T>
        <T v="small">{l(turn.meaning)}</T>
      </View>
    </Row>
    {help ? <View style={[e.card, { backgroundColor: theme.yellow }]}><T es center style={e.target}>{turn.answer}</T><T v="small" center>{l(turn.answerMeaning)}</T></View>
      : <View style={{ gap: 6 }}>
        <T v="small" center>{t("ex.blocks")}</T>
        <View style={e.bank}>{blocks.map((word, i) => <View key={`${word}-${i}`} style={e.block}><T es style={e.blockText}>{word}</T></View>)}</View>
      </View>}
    {!locked && !typing && <OralInput prompt={turn.es} idleKey="mic.answer" expected={expected} accept={(text) => judgeTurn(text, turn, vocabulary)} onAnswer={answer}
      actions={<>
        <Pill icon="⌨" label={t("btn.type")} onPress={() => setTyping(true)} />
        <Pill icon="💡" label={t("btn.help")} active={help} onPress={() => setHelp((v) => !v)} />
      </>} />}
    {typing && <>
      {!locked && <Speaker text={turn.es} size={52} />}
      <TextInput value={reply} onChangeText={setReply} editable={!locked} accessibilityLabel={t("ex.write")} placeholder={t("write.placeholder")}
        placeholderTextColor={theme.muted} style={e.input} multiline maxLength={300} autoCorrect={false} autoCapitalize="sentences" />
      {!locked && <Row>
        <Pill icon="💡" label={t("btn.help")} active={help} onPress={() => setHelp((v) => !v)} />
        {!noSpeech && <Pill icon="🎙" label={t("btn.speak")} onPress={() => setTyping(false)} />}
      </Row>}
      <Check locked={locked} disabled={!reply.trim()} label={t("common.check")} onPress={() => answer(reply)} />
    </>}
  </View>;
}
// Words: tap matching pairs. The Spanish word is spoken when tapped.
export function Match({ ex, locked, onResult }: Props<"match">) {
  const { t, l, course } = useApp();
  const { say } = useSay();
  const words = useMemo(() => ex.items.map((item) => resolveItem(course, item)).flatMap((found) => (found?.kind === "word" ? [found.word] : [])), [course, ex.items]);
  const left = useMemo(() => shuffle(words.map((_, i) => i), words.length + 3), [words]);
  const right = useMemo(() => shuffle(words.map((_, i) => i), words.length + 11), [words]);
  const [pick, setPick] = useState<{ l: number | null; r: number | null }>({ l: null, r: null });
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  function choose(side: "l" | "r", w: number) {
    const next = { ...pick, [side]: w };
    if (side === "l") void say(words[w].es);
    if (next.l === null || next.r === null) { setPick(next); return; }
    setPick({ l: null, r: null });
    if (next.l !== next.r) { setWrong(true); return; }
    const matched = [...done, next.l]; setDone(matched); setWrong(false);
    if (matched.length === words.length) setTimeout(() => onResult({ ok: true }), 300);
  }
  const cell = (w: number, side: "l" | "r") => {
    const matched = done.includes(w);
    return <Pressable key={`${side}${w}`} disabled={matched || locked} accessibilityRole="button" accessibilityState={{ selected: pick[side] === w, disabled: matched }}
      onPress={() => choose(side, w)} style={[e.option, pick[side] === w && e.picked, matched && { opacity: 0.35 }]}>
      <T es={side === "l"} style={e.tileText}>{side === "l" ? `${words[w].emoji} ${words[w].es}` : l(words[w].meaning)}</T>
    </Pressable>;
  };
  return <View style={e.body}>
    <T v="h2">{t("ex.match")}</T>
    <Row style={{ alignItems: "flex-start", gap: 10 }}>
      <View style={{ flex: 1, gap: 10 }}>{left.map((w) => cell(w, "l"))}</View>
      <View style={{ flex: 1, gap: 10 }}>{right.map((w) => cell(w, "r"))}</View>
    </Row>
    {wrong && <T center>{t("match.wrong")}</T>}
  </View>;
}
// Words: choose the meaning (or, for well-known words, the Spanish word).
export function Choose({ ex, locked, onResult }: Props<"choose">) {
  const { t, l, course } = useApp();
  const [pick, setPick] = useState<string | null>(null);
  const target = resolveItem(course, ex.item);
  if (target?.kind !== "word") throw new Error(`Unknown word item ${ex.item}`);
  const word = target.word;
  const label = (item: string) => {
    const option = resolveItem(course, item);
    return option?.kind === "word" ? (ex.reverse ? option.word.es : l(option.word.meaning)) : "";
  };
  return <View style={e.body}>
    <T v="h2">{t(ex.reverse ? "ex.chooseReverse" : "ex.choose")}</T>
    <View style={e.card}>
      <T accessible={false} style={{ fontSize: 44 }}>{word.emoji}</T>
      <T es={!ex.reverse} center style={e.target}>{ex.reverse ? l(word.meaning) : word.es}</T>
    </View>
    {!ex.reverse && <Speaker text={word.es} size={52} />}
    {ex.options.map((item) => <Pressable key={item} disabled={locked} accessibilityRole="radio" accessibilityState={{ checked: pick === item }}
      onPress={() => setPick(item)} style={[e.option, pick === item && e.picked]}>
      <T es={ex.reverse} center style={e.tileText}>{label(item)}</T>
    </Pressable>)}
    <Check locked={locked} disabled={!pick} label={t("common.check")}
      onPress={() => onResult({ ok: pick === ex.item, solution: ex.reverse ? word.es : l(word.meaning), note: `${word.es} · ${word.example}` })} />
  </View>;
}
const e = StyleSheet.create({
  body: { gap: 16 },
  card: { backgroundColor: theme.pale, borderRadius: 18, padding: 20, gap: 8, alignItems: "center" },
  meaning: { fontSize: 15, color: theme.muted },
  target: { fontSize: 23, lineHeight: 30, fontWeight: "700", color: theme.green, letterSpacing: -0.4 },
  answer: { minHeight: 60, borderBottomWidth: 1, borderColor: theme.line, flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 8 },
  bank: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tile: { borderWidth: 1, borderColor: theme.line, backgroundColor: theme.paper, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 },
  tileText: { fontSize: 17, color: theme.green, fontWeight: "600" },
  input: { ...k.body, borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 16, fontSize: 18, color: theme.green, minHeight: 104, textAlignVertical: "top", backgroundColor: theme.paper },
  option: { borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 15, minHeight: 54, justifyContent: "center", backgroundColor: theme.paper },
  picked: { borderColor: theme.green, backgroundColor: theme.pale },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#dfc8a8", alignItems: "center", justifyContent: "center" },
  bubble: { flex: 1, backgroundColor: theme.pale, borderRadius: 16, borderTopLeftRadius: 4, padding: 16, gap: 6 },
  bubbleEs: { fontSize: 20, lineHeight: 26, fontWeight: "700", color: theme.green },
  block: { borderWidth: 1, borderColor: theme.line, backgroundColor: theme.paper, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  blockText: { fontSize: 15, color: theme.green, fontWeight: "600" },
});
