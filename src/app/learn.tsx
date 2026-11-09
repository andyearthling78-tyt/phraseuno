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
import { OralPractice } from "../components/oral-practice";
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
import {
  assess,
  fresh,
  normalize,
  percent,
} from "../lib/learning";
export default function Learn() {
  const { t } = useI18n();
  const Alert = useLocalizedAlert();
  const { state, setState, saveError, lesson, openDay } = useLearning();
  const { phrases, words, turns } = lesson;
  const [writing, setWriting] = useState(false);
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
    setWritten(""); setPassed(false); setWritingPassed(false); setWriting(false); setFeedback(""); setHint(false);
  }
  function check() {
    const ok = normalize(written) === normalize(phrases[state.build].phrase);
    setWritingPassed(ok);
    if (ok) setPassed(true);
    setFeedback(ok ? "¡Muy bien! " + phrases[state.build].tip : "Fast! Vergleiche deinen Satz mit dem Beispiel und versuche es noch einmal.");
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
  const p = phrases[Math.min(state.build, 3)],
    turn = turns[Math.min(state.chat, 3)],
    w = words[state.card];
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page lesson autoScroll={state.stage === "chat"}>
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
            <Label>01 / PHRASEN · {state.build + 1} VON 4</Label>
            <Text style={s.title}>
              {lesson.title}
            </Text>
            <Text style={s.subtitle}>{p.de}</Text>
            <View style={l.phrase}>
              <Text style={[s.h2, s.center]}>{p.phrase}</Text>
            </View>
            {!passed && <OralPractice key={`build-${lesson.id}-${state.build}`} prompt={p.phrase} repeat onAnswer={text => {
              const ok = matchesSpokenPhrase(text, p.phrase);
              setPassed(ok);
              setFeedback(ok ? "Gut verstanden! Du hast den Satz gesprochen." : "Noch einmal ganz entspannt. Höre den Satz erneut und sprich ihn vollständig nach.");
            }} />}
            {passed && <Text accessibilityLiveRegion="polite" style={s.body}>✓ Gut gemacht. Weiter in deinem Tempo.</Text>}
            <Button secondary onPress={() => setWriting(value => !value)}>{writing ? "Schreibübung schließen" : "Optional: auch schreiben üben"}</Button>
            {writing && <>
              <Text style={s.small}>Schreibe den vollständigen Satz auf Spanisch.</Text>
              <TextInput value={written} onChangeText={value => { setWritten(value); setWritingPassed(false); }} accessibilityLabel={t("Den Satz auf Spanisch schreiben")} placeholder={t("Dein spanischer Satz …")} placeholderTextColor={C.muted} style={l.input} multiline maxLength={300} autoCorrect={false} />
              <Button onPress={check} disabled={writingPassed || !written.trim()}>Schreiben prüfen ✓</Button>
            </>}
            {feedback !== "" && <View accessibilityLiveRegion="polite" style={s.note}><Text style={s.body}>{feedback}</Text></View>}
            {hint && <Text style={s.body}>💡 {p.tip}</Text>}
            {passed && <Button onPress={advance}>{state.build === 3 ? "Zum Dialog →" : "Weiter →"}</Button>}
            <Button secondary onPress={() => setHint((v) => !v)}>
              {hint ? "Hilfe ausblenden" : "💡 Kleine Hilfe"}
            </Button>
          </Card>
        )}
        {state.stage === "chat" && (
          <Card>
            <View style={s.row}>
              <View style={l.avatar}>
                <Text style={{ fontSize: 27 }}>👩🏽</Text>
              </View>
              <View>
                <Text style={s.h2}>{lesson.context}</Text>
                <Text style={s.small}>
                  Simulierter Dialog · {Math.min(state.chat + 1, 4)} / 4
                </Text>
              </View>
            </View>
            {state.messages.map((m, i) => (
              <View
                key={i}
                style={[l.bubble, m.role === "user" && l.userBubble]}
              >
                <Text
                  translate={m.role !== "user"}
                  style={[s.body, m.role === "user" && { color: C.cream }]}
                >
                  {m.text}
                </Text>
              </View>
            ))}
            {state.chat < 4 ? (
              <>
                <View style={l.bubble}>
                  <Text style={s.body}>{turn.es}</Text>
                  <Text style={[s.small, { marginTop: 8 }]}>{turn.de}</Text>
                </View>
                {!hint && <OralPractice key={`chat-${lesson.id}-${state.chat}`} prompt={turn.es} onAnswer={send} />}
                <Button secondary onPress={() => setWriting(value => !value)}>{writing ? "Schreibübung schließen" : "Optional: Antwort tippen"}</Button>
                {writing && <>
                <TextInput
                  value={reply}
                  onChangeText={setReply}
                  accessibilityLabel={t("Deine Antwort auf Spanisch")}
                  placeholder={t("Deine Antwort auf Spanisch …")}
                  placeholderTextColor={C.muted}
                  style={l.input}
                  maxLength={300}
                  multiline
                  autoCorrect={false}
                  autoCapitalize="sentences"
                />
                <Button disabled={!reply.trim()} onPress={() => send()}>
                  Antwort senden ↗
                </Button>
                </>}
                <Button secondary onPress={() => setHint((v) => !v)}>
                  💡 Antwort-Hilfe
                </Button>
                {hint && (
                  <View style={s.note}>
                    <Text style={s.body}>{turn.hint}</Text>
                    <Speak text={turn.hint} />
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={l.bubble}>
                  <Text style={s.body}>¡Muy bien! ✨</Text>
                  <Text style={s.small}>
                    Du hast dich verständlich gemacht!
                  </Text>
                </View>
                <Button
                  onPress={() => {
                    setHint(false);
                    setState((v) => ({ ...v, stage: "cards" }));
                  }}
                >
                  Jetzt Wörter festigen →
                </Button>
              </>
            )}
            <Text style={s.small}>
              Höre Lucía zu und antworte laut. Schreiben ist freiwillig. Die Rückmeldung bezieht sich auf erkannte Wörter und ist keine Aussprachebewertung.
            </Text>
          </Card>
        )}
        {state.stage === "cards" && (
          <Card>
            <Text style={s.h2}>Lerntag geschafft! ✨</Text>
            <Text style={s.body}>Jetzt folgt deine freiwillige Vokabel-Zusatzübung. Du kannst sie später im Vokabel-Reiter fortsetzen. Vor der nächsten Lernwoche werden alle Wochenwörter wiederholt.</Text>
            <Label>03 / WÖRTER · {state.known.length} VON 3 SICHER</Label>
            <Text style={s.title}>Schon vertraut.</Text>
            <Text style={s.subtitle}>
              Erst erinnern, dann umdrehen. Du kennst das Wort aus deinem
              Gespräch.
            </Text>
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
            <Text style={[s.small, s.center]}>
              Unsichere Wörter kommen noch einmal dran.
            </Text>
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
            <Button secondary onPress={() => router.replace("/")}>
              Zur Übersicht
            </Button>
            <Text style={[s.small, s.center]}>
              Sieben Lerntage. Schritt für Schritt.
            </Text>
          </Card>
        )}
      </Page>
    </KeyboardAvoidingView>
  );
}
const l = StyleSheet.create({
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
