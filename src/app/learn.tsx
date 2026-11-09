import { useI18n, useLocalizedAlert } from "../lib/i18n";
import { Text } from "../components/localized-text";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { OralPractice, Pill } from "../components/oral-practice";
import { usePreferences } from "../lib/preferences";
import { ListenStep } from "../components/listen-step";
import { matchesSpokenPhrase } from "../lib/oral-model";
import { learningSpeech } from "../lib/speech";
import {
  Button,
  Card,
  C,
  Label,
  Page,
  Progress,
  s,
  Speak,
} from "../components/ui";
import { useLearning } from "../lib/store";
import { weekStatus } from "../lib/course";
import {
  assess,
  fresh,
  normalize,
  percent,
} from "../lib/learning";
type PhraseStep = "listen" | "speak" | "read" | "write";
const STEPS: { id: PhraseStep; label: string }[] = [
  { id: "listen", label: "Hören" },
  { id: "speak", label: "Nachsprechen" },
  { id: "read", label: "Lesen" },
  { id: "write", label: "Schreiben" },
];
function StepTrail({ step }: { step: PhraseStep }) {
  const current = STEPS.findIndex((item) => item.id === step);
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 4, now: current + 1 }} style={l.trail}>
    {STEPS.map((item, index) => <View key={item.id} style={[l.trailItem, index <= current && l.trailDone, index === current && l.trailActive]}>
      <Text style={[l.trailText, index <= current && { color: C.green, fontWeight: "700" }]}>{index < current ? "✓ " : ""}{item.label}</Text>
    </View>)}
  </View>;
}
function Dots({ total, done }: { total: number; done: number }) {
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: done }} style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
    {Array.from({ length: total }, (_, i) => <View key={i} style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: i < done ? C.green : i === done ? C.yellow : C.line }} />)}
  </View>;
}
function BuiltPhrase({ phrase, add }: { phrase: string; add: string }) {
  const at = phrase.toLowerCase().lastIndexOf(add.toLowerCase());
  if (at < 0) return <Text translate={false} style={[s.h2, s.center]}>{phrase}</Text>;
  return <Text translate={false} style={[s.h2, s.center]}>
    {phrase.slice(0, at)}<Text translate={false} style={l.newPart}>{phrase.slice(at, at + add.length)}</Text>{phrase.slice(at + add.length)}
  </Text>;
}
export default function Learn() {
  const { t } = useI18n();
  const Alert = useLocalizedAlert();
  const { state, setState, saveError, lesson, openDay, course } = useLearning();
  const { preferences } = usePreferences();
  const { phrases, words, turns } = lesson;
  const [writing, setWriting] = useState(false);
  const [step, setStep] = useState<PhraseStep>("listen");
  const [writingPassed, setWritingPassed] = useState(false);
  const [written, setWritten] = useState("");
  const [passed, setPassed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState(false);
  const [reply, setReply] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [flip] = useState(() => new Animated.Value(0));
  const reduced = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      reduced.current = v;
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => {
        reduced.current = v;
      },
    );
    return () => {
      sub.remove();
      learningSpeech.stop();
    };
  }, []);
  function flipCard() {
    const next = !flipped;
    setFlipped(next);
    Animated.timing(flip, {
      toValue: next ? 1 : 0,
      duration: reduced.current ? 0 : 420,
      useNativeDriver: true,
    }).start();
  }
  function nextCard(known: boolean) {
    setFlipped(false);
    flip.setValue(0);
    setState((v) => {
      const learned = known ? [...new Set([...v.known, v.card])] : v.known;
      if (learned.length === 3)
        return {
          ...v,
          known: learned,
          stage: "summary",
          completedAt: new Date().toISOString(),
        };
      let card = v.card;
      for (let i = 1; i <= 3; i++) {
        const n = (v.card + i) % 3;
        if (!learned.includes(n)) {
          card = n;
          break;
        }
      }
      return { ...v, known: learned, card };
    });
  }
  function advance() {
    setState(v => ({ ...v, build: v.build + 1, stage: v.build === 3 ? "chat" : "build" }));
    setWritten(""); setPassed(false); setWritingPassed(false); setWriting(false); setFeedback(""); setHint(false); setStep("listen");
  }
  function check() {
    const ok = normalize(written) === normalize(phrases[state.build].phrase);
    setWritingPassed(ok);
    setFeedback(ok ? "✓ ¡Muy bien! Dieser Baustein sitzt." : "Fast! Vergleiche mit dem Satz oben.");
  }
  function send(answer: string = reply) {
    const text = answer.trim();
    if (!text) return;
    const result = assess(text, state.chat, turns);
    setState((v) => ({
      ...v,
      chat: v.chat + (result.ok ? 1 : 0),
      ...(result.ok && v.chat === 3 ? { stage: "cards" as const, completedAt: new Date().toISOString(), card: [0, 1, 2].find(i => !v.known.includes(i)) ?? 0 } : {}),
      messages: [
        ...v.messages,
        { role: "user", text },
        { role: "teacher", text: result.message },
      ].slice(-100) as typeof v.messages,
    }));
    setReply("");
    setHint(false);
    if (result.ok) setWriting(false);
  }
  const lastUser = [...state.messages].reverse().find((m) => m.role === "user")?.text;
  const lastTeacher = state.messages.length && state.messages[state.messages.length - 1].role === "teacher" ? state.messages[state.messages.length - 1].text : undefined;
  const lastOk = !!lastTeacher && turns.some((x) => x.success === lastTeacher);
  const p = phrases[Math.min(state.build, 3)],
    turn = turns[Math.min(state.chat, 3)],
    w = words[state.card];
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page lesson>
        <View style={s.row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            style={{ paddingVertical: 10, paddingRight: 10 }}
          >
            <Text style={{ fontSize: 12, color: C.green }}>← Mein Lerntag</Text>
          </Pressable>
          <Progress value={percent(state)} />
          <Text style={s.small}>{percent(state)}%</Text>
        </View>
        {state.stage === "intro" && (
          <Card>
            <Text style={s.h2}>Bereit für deinen nächsten Satz?</Text>
            <Button onPress={() => setState((v) => ({ ...v, stage: "build" }))}>
              Los geht’s →
            </Button>
          </Card>
        )}
        {state.stage === "build" && (
          <Card>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.small}>Baustein {state.build + 1} / 4</Text>
              <Dots total={4} done={state.build} />
            </View>
            <StepTrail step={step} />
            <Text style={[s.subtitle, s.center]}>{p.de}</Text>
            {step === "listen" || step === "speak" ? (
              <View style={l.phrase}>
                {hint ? <Text translate={false} style={[s.h2, s.center]}>{p.phrase}</Text>
                  : <Text accessible={false} style={{ fontSize: 40 }}>🎧</Text>}
              </View>
            ) : (
              <View style={l.phrase}>
                <BuiltPhrase phrase={p.phrase} add={p.add} />
                <Speak text={p.phrase} />
              </View>
            )}
            {step === "listen" && <ListenStep key={`listen-${lesson.id}-${state.build}`} prompt={p.phrase} onContinue={() => { setStep("speak"); setFeedback(""); setHint(false); }} />}
            {step === "speak" && <>
              {!passed && <OralPractice key={`build-${lesson.id}-${state.build}`} prompt={p.phrase} repeat autoPlay={false} onAnswer={text => {
                const ok = matchesSpokenPhrase(text, p.phrase);
                setPassed(ok);
                setFeedback(ok ? "✓ Gut verstanden!" : `„${text}“\nNoch einmal ganz entspannt.`);
              }} actions={<>
                <Pill label={hint ? "Text verbergen" : "💡 Text zeigen"} active={hint} onPress={() => setHint((v) => !v)} />
                <Pill label="Überspringen →" onPress={() => { setStep("read"); setFeedback(""); setHint(false); }} />
              </>} />}
              {feedback !== "" && <Text accessibilityLiveRegion="polite" style={[s.body, s.center]}>{feedback}</Text>}
              {passed && <Button onPress={() => { setStep("read"); setFeedback(""); setHint(false); }}>Weiter zum Lesen →</Button>}
            </>}
            {step === "read" && <>
              <Text style={[s.small, s.center]}>💡 {p.tip}</Text>
              <Button onPress={() => { setStep("write"); setFeedback(""); }}>Jetzt schreiben →</Button>
            </>}
            {step === "write" && <>
              <TextInput value={written} onChangeText={value => { setWritten(value); setWritingPassed(false); }} accessibilityLabel={t("Den Satz auf Spanisch schreiben")} placeholder={t("Schreibe den Satz auf Spanisch …")} placeholderTextColor={C.muted} style={l.input} multiline maxLength={300} autoCorrect={false} autoCapitalize="sentences" editable={!writingPassed} />
              {feedback !== "" && <Text accessibilityLiveRegion="polite" style={[s.body, s.center]}>{feedback}</Text>}
              {!writingPassed && <Button onPress={check} disabled={!written.trim()}>Prüfen ✓</Button>}
              {writingPassed && <Button onPress={advance}>{state.build === 3 ? "Zum Dialog →" : "Nächster Baustein →"}</Button>}
            </>}
          </Card>
        )}
        {state.stage === "chat" && (
          <Card>
            <View style={s.row}>
              <View style={l.avatar}>
                <Text style={{ fontSize: 24 }}>{preferences.voiceGender === "male" ? "👨🏽" : "👩🏽"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>{lesson.label}</Text>
                <Dots total={4} done={state.chat} />
              </View>
            </View>
            {state.chat < 4 ? (
              <>
                {lastUser && lastTeacher && (
                  <View style={[l.feedback, lastOk ? l.feedbackOk : l.feedbackTry]} accessibilityLiveRegion="polite">
                    <Text translate={false} style={s.small}>„{lastUser}“</Text>
                    <Text style={s.body}>{lastOk ? "✓ " : "↻ "}{lastTeacher}</Text>
                  </View>
                )}
                <View style={l.question}>
                  <Text translate={false} style={l.questionEs}>{turn.es}</Text>
                  <Text style={s.small}>{turn.de}</Text>
                </View>
                {hint && (
                  <View style={[l.question, { backgroundColor: C.yellow }]}>
                    <Text translate={false} style={[s.h2, s.center]}>{turn.hint}</Text>
                    <Speak text={turn.hint} />
                  </View>
                )}
                {!hint && !writing && <OralPractice key={`chat-${lesson.id}-${state.chat}`} prompt={turn.es} onAnswer={send}
                  actions={<>
                    <Pill label="⌨ Tippen" onPress={() => setWriting(true)} />
                    <Pill label="💡 Hilfe" onPress={() => setHint(true)} />
                  </>} />}
                {hint && <Button secondary onPress={() => setHint(false)}>Verstanden – jetzt selbst sagen</Button>}
                {writing && <>
                  <TextInput value={reply} onChangeText={setReply} autoFocus
                    accessibilityLabel={t("Deine Antwort auf Spanisch")} placeholder={t("Deine Antwort auf Spanisch …")}
                    placeholderTextColor={C.muted} style={l.input} maxLength={300} multiline autoCorrect={false} autoCapitalize="sentences" />
                  <Button disabled={!reply.trim()} onPress={() => send()}>Antwort senden ↗</Button>
                  <Button secondary onPress={() => setWriting(false)}>🎙 Lieber sprechen</Button>
                </>}
              </>
            ) : (
              <>
                <View style={[l.feedback, l.feedbackOk]}>
                  <Text style={s.h2}>¡Muy bien! ✨</Text>
                  <Text style={s.body}>Dialog geschafft.</Text>
                </View>
                <Button onPress={() => { setHint(false); setState((v) => ({ ...v, stage: "cards" })); }}>
                  Weiter zu den Vokabeln →
                </Button>
              </>
            )}
          </Card>
        )}
        {state.stage === "cards" && (
          <Card>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.h2}>Vokabelabfrage</Text>
              <Dots total={3} done={state.known.length} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(`Karte umdrehen: ${flipped ? w.de : w.es}`)}
              accessibilityHint={t(
                "Doppeltippen, um die andere Seite zu zeigen",
              )}
              onPress={flipCard}
              style={l.flash}
            >
              <Animated.View
                accessibilityElementsHidden={flipped}
                importantForAccessibility={
                  flipped ? "no-hide-descendants" : "auto"
                }
                style={[
                  l.face,
                  {
                    transform: [
                      { perspective: 1000 },
                      {
                        rotateY: flip.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={{ fontSize: 55, marginBottom: 18 }}>
                  {w.symbol}
                </Text>
                <Text style={l.word}>{w.es}</Text>
                <Text style={[s.small, { marginTop: 16 }]}>
                  Was heißt das auf Deutsch?
                </Text>
                <Text style={s.small}>Tippen zum Umdrehen</Text>
              </Animated.View>
              <Animated.View
                accessibilityElementsHidden={!flipped}
                importantForAccessibility={
                  !flipped ? "no-hide-descendants" : "auto"
                }
                style={[
                  l.face,
                  {
                    backgroundColor: C.green,
                    transform: [
                      { perspective: 1000 },
                      {
                        rotateY: flip.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["180deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={[l.word, { color: C.cream }]}>{w.de}</Text>
                <Text
                  style={[
                    s.body,
                    s.center,
                    { color: "#d2ddc5", marginTop: 20 },
                  ]}
                >
                  {w.note}
                </Text>
                <Text style={[s.small, { color: "#b5c6a7", marginTop: 16 }]}>
                  {w.example}
                </Text>
              </Animated.View>
            </Pressable>
            <View style={[s.row, { justifyContent: "center" }]}>
              <Speak text={w.es} />
              <Text style={s.small}>Spanische Aussprache</Text>
            </View>
            <Button disabled={!flipped} onPress={() => nextCard(true)}>
              Kann ich ✓
            </Button>
            <Button
              secondary
              disabled={!flipped}
              onPress={() => nextCard(false)}
            >
              Noch einmal üben ↻
            </Button>
            <Button secondary onPress={() => setState(v => ({ ...v, stage: "summary", completedAt: v.completedAt ?? new Date().toISOString() }))}>Vokabeln später üben →</Button>
          </Card>
        )}
        {state.stage === "summary" && (
          <Card>
            <View style={l.badge}>
              <Text style={{ fontSize: 37, color: C.green }}>✦</Text>
            </View>
            <Label>Tag {lesson.id} · geschafft</Label>
            <Text style={[s.title, s.center]}>
              Ein weiterer spanischer Moment.
            </Text>
            <Text style={[s.body, s.center]}>
              {lesson.summary}
            </Text>
            <View style={s.row}>
              {[
                ["4", "Phrasen"],
                ["1", "Dialog"],
                [`${state.known.length}/3`, "Wörter"],
              ].map(([n, text]) => (
                <View style={s.stat} key={text}>
                  <Text style={s.statNumber}>{n}</Text>
                  <Text style={s.small}>{text}</Text>
                </View>
              ))}
            </View>
            <View style={l.phrase}>
              <Text style={[s.h2, s.center]}>{phrases[3].phrase}.</Text>
              <Speak text={phrases[3].phrase} />
            </View>
            <Text style={[s.small, s.center]}>
              {saveError
                ? "Abgeschlossen; Speichern momentan nicht verfügbar."
                : "✓ Dein Abschluss bleibt auf diesem Gerät gespeichert."}
            </Text>
            <Button
              onPress={() =>
                Alert.alert(
                  "Lerntag wiederholen?",
                  "Der Fortschritt dieses Lerntags wird zurückgesetzt. Deine anderen Lerntage bleiben erhalten.",
                  [
                    { text: "Abbrechen", style: "cancel" },
                    {
                      text: "Wiederholen",
                      onPress: () => {
                        setState({ ...fresh(), stage: "build" });
                        setStep("listen");
                        setWritingPassed(false);
                        setPassed(false);
                        setWritten("");
                        setFeedback("");
                        setHint(false);
                      },
                    },
                  ],
                )
              }
            >
              Lerntag noch einmal üben ↻
            </Button>
            <Button secondary onPress={() => router.replace("/words")}>Vokabeln aus diesem Lerntag üben →</Button>
            {lesson.id < 7 && <Button onPress={() => { openDay(lesson.id + 1); router.replace("/"); }}>Nächster Lerntag →</Button>}
            {weekStatus(course).completedDays === 7 && !course.weekReviewedAt && <Button accent onPress={() => router.replace({ pathname: "/words", params: { review: "week" } })}>Wochenabfrage starten →</Button>}
            <Button secondary onPress={() => router.replace("/")}>
              Zur Übersicht
            </Button>
          </Card>
        )}
      </Page>
    </KeyboardAvoidingView>
  );
}
const l = StyleSheet.create({
  question: { backgroundColor: C.pale, borderRadius: 18, padding: 20, gap: 8, alignItems: "center" },
  questionEs: { fontSize: 24, fontWeight: "700", color: C.green, textAlign: "center", letterSpacing: -0.4 },
  feedback: { borderRadius: 14, padding: 14, gap: 4 },
  feedbackOk: { backgroundColor: "#dfeccf" },
  feedbackTry: { backgroundColor: "#f6e7c4" },
  trail: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  trailItem: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper },
  trailDone: { borderColor: C.green, backgroundColor: C.pale },
  trailActive: { backgroundColor: C.yellow, borderColor: C.yellow },
  trailText: { fontSize: 12, color: C.muted },
  newPart: { backgroundColor: C.yellow, color: C.green },
  phrase: {
    backgroundColor: C.pale,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    gap: 13,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#dfc8a8",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    padding: 17,
    backgroundColor: C.pale,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    maxWidth: "95%",
  },
  userBubble: {
    backgroundColor: C.green,
    alignSelf: "flex-end",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: C.green,
    minHeight: 90,
    textAlignVertical: "top",
    backgroundColor: C.paper,
  },
  flash: { height: 280, width: "100%" },
  face: {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    backgroundColor: C.pale,
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  word: { fontSize: 32, fontWeight: "700", letterSpacing: -1, color: C.green },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.yellow,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
