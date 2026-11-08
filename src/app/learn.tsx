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
  phrases,
  words,
  turns,
} from "../lib/learning";
export default function Learn() {
  const { t } = useI18n();
  const Alert = useLocalizedAlert();
  const { state, setState, saveError } = useLearning();
  const [picked, setPicked] = useState<string[]>([]);
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
  function check() {
    if (passed) {
      setState((v) => ({
        ...v,
        build: v.build + 1,
        stage: v.build === 3 ? "chat" : "build",
      }));
      setPicked([]);
      setPassed(false);
      setFeedback("");
      setHint(false);
      return;
    }
    const ok =
      normalize(picked.join(" ")) === normalize(phrases[state.build].add);
    setPassed(ok);
    setFeedback(
      ok
        ? "¡Muy bien! " + phrases[state.build].tip
        : "Fast! Tippe die Wörter zum Zurücklegen an und versuche es noch einmal.",
    );
  }
  function send() {
    const text = reply.trim();
    if (!text) return;
    const result = assess(text, state.chat);
    setState((v) => ({
      ...v,
      chat: v.chat + (result.ok ? 1 : 0),
      messages: [
        ...v.messages,
        { role: "user", text },
        { role: "teacher", text: result.message },
      ].slice(-100) as typeof v.messages,
    }));
    setReply("");
    setHint(false);
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
            <Text style={s.h2}>Bereit für deinen ersten Satz?</Text>
            <Button onPress={() => setState((v) => ({ ...v, stage: "build" }))}>
              Los geht’s →
            </Button>
          </Card>
        )}
        {state.stage === "build" && (
          <Card>
            <Label>01 / PHRASEN · {state.build + 1} VON 4</Label>
            <Text style={s.title}>
              {
                [
                  "Dein erster Satz.",
                  "Ein bisschen mehr du.",
                  "Freundlich bestellen.",
                  "Dein Kaffee kommt mit.",
                ][state.build]
              }
            </Text>
            <Text style={s.subtitle}>{p.de}</Text>
            <View style={l.phrase}>
              <Text style={[s.h2, s.center]}>{p.phrase}</Text>
              <Speak text={p.phrase} />
            </View>
            <Text style={[s.small, s.center]}>
              {state.build
                ? "Ergänze die neuen Wörter in der richtigen Reihenfolge."
                : "Tippe die Wörter in der richtigen Reihenfolge an."}
            </Text>
            <View style={s.answer}>
              {state.build > 0 && (
                <Text style={[s.small, s.center]}>
                  {phrases[state.build - 1].phrase}
                </Text>
              )}
              <View style={s.wrap}>
                {picked.length ? (
                  picked.map((word, i) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t(`${word} zurücklegen`)}
                      disabled={passed}
                      key={`${word}-${i}`}
                      onPress={() => {
                        setPicked((v) => v.filter((_, n) => n !== i));
                        setFeedback("");
                      }}
                      style={[s.token, { backgroundColor: C.pale }]}
                    >
                      <Text style={s.tokenText}>{word}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={s.small}>Hier entsteht dein Satz …</Text>
                )}
              </View>
            </View>
            <View style={s.wrap}>
              {p.tokens.map((word) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={picked.includes(word) || passed}
                  accessibilityState={{
                    disabled: picked.includes(word) || passed,
                  }}
                  key={word}
                  onPress={() => {
                    setPicked((v) => [...v, word]);
                    setFeedback("");
                  }}
                  style={[
                    s.token,
                    (picked.includes(word) || passed) && { opacity: 0.25 },
                  ]}
                >
                  <Text style={s.tokenText}>{word}</Text>
                </Pressable>
              ))}
            </View>
            {feedback !== "" && (
              <View accessibilityLiveRegion="polite" style={s.note}>
                <Text style={s.body}>{feedback}</Text>
              </View>
            )}
            {hint && <Text style={s.body}>💡 {p.tip}</Text>}
            <Button onPress={check} disabled={!passed && !picked.length}>
              {passed
                ? state.build === 3
                  ? "Zum Café-Dialog →"
                  : "Weiter →"
                : "Prüfen ✓"}
            </Button>
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
                <Text style={s.h2}>Mit Lucía im Café</Text>
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
                  <View style={{ marginTop: 10 }}>
                    <Speak text={turn.es} />
                  </View>
                </View>
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
                <Button disabled={!reply.trim()} onPress={send}>
                  Antwort senden ↗
                </Button>
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
                  <Text style={s.body}>¡Aquí tienes tu café! ☕</Text>
                  <Text style={s.small}>
                    Hier ist dein Kaffee. Du hast dich verständlich gemacht!
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
              Lucía spricht per Geräte-Sprachausgabe. Antworte schriftlich oder
              sprich den Satz für dich nach. Keine Mikrofonaufnahme und keine
              Aussprachebewertung.
            </Text>
          </Card>
        )}
        {state.stage === "cards" && (
          <Card>
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
          </Card>
        )}
        {state.stage === "summary" && (
          <Card>
            <View style={l.badge}>
              <Text style={{ fontSize: 37, color: C.green }}>✦</Text>
            </View>
            <Label>TAG 01 · GESCHAFFT</Label>
            <Text style={[s.title, s.center]}>
              Dein erster{"\n"}spanischer Moment.
            </Text>
            <Text style={[s.body, s.center]}>
              Du hast einen Kaffee bestellt. Mit Milch. Freundlich. Zum
              Mitnehmen.
            </Text>
            <View style={s.row}>
              {[
                ["4", "Phrasen"],
                ["1", "Dialog"],
                ["3", "Wörter"],
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
                  "Der Fortschritt von Tag 1 wird zurückgesetzt, damit du alle Übungen erneut machen kannst.",
                  [
                    { text: "Abbrechen", style: "cancel" },
                    {
                      text: "Wiederholen",
                      onPress: () => {
                        setState({ ...fresh(), stage: "build" });
                        setPassed(false);
                        setPicked([]);
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
            <Button secondary onPress={() => router.replace("/")}>
              Zur Übersicht
            </Button>
            <Text style={[s.small, s.center]}>
              Prototyp · Tag 1 ist vollständig spielbar.
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
