import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Linking, Pressable, StyleSheet, Text as RNText, View } from "react-native";
import { tutorName } from "../domain/prefs";
import type { Key } from "../i18n/de";
import { useApp } from "../state/app";
import { Button, k, Pill, Row, T } from "../ui/kit";
import { theme } from "../ui/theme";
import { useRecognition, useSay } from "./voice";

/** 🐇 natural / 🐌 slow. The choice is saved; it does not start playback by itself. */
export function SpeedToggle() {
  const { prefs, setPrefs, t } = useApp();
  return <View accessibilityRole="radiogroup" style={p.speed}>
    {([["natural", "🐇", "speed.natural"], ["slow", "🐌", "speed.slow"]] as const).map(([value, icon, label]) => {
      const on = prefs.speed === value;
      return <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={t(label)}
        onPress={() => setPrefs({ speed: value })} style={[p.speedOption, on && { backgroundColor: theme.yellow }]}>
        <RNText accessible={false} style={{ fontSize: 20 }}>{icon}</RNText>
      </Pressable>;
    })}
  </View>;
}
/** Round play button with tempo switch. Plays only when tapped. */
export function Speaker({ text, size = 72, compact = false }: { text: string; size?: number; compact?: boolean }) {
  const { t } = useApp();
  const { say, speaking, error } = useSay();
  return <View style={{ gap: 8 }}>
    <Row style={{ justifyContent: "center", gap: 14 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t("btn.listen")} onPress={() => { void say(text); }}
        style={({ pressed }) => [p.speaker, { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.75 : 1 }, speaking && { backgroundColor: theme.greenSoft }]}>
        <RNText accessible={false} style={{ fontSize: size * 0.4, color: theme.cream }}>♪</RNText>
      </Pressable>
      {!compact && <SpeedToggle />}
    </Row>
    {error && !compact && <T v="small" center>{t(error)}</T>}
  </View>;
}
/** Big microphone: green = ready, red and pulsing with input level = speak now. */
function Mic({ phase, level, speaking, idleKey, onPress }: { phase: "idle" | "starting" | "listening"; level: number; speaking: boolean; idleKey: Key; onPress: () => void }) {
  const { t, prefs } = useApp();
  const [pulse] = useState(() => new Animated.Value(0));
  const [volume] = useState(() => new Animated.Value(0));
  const listening = phase === "listening";
  useEffect(() => {
    if (!listening) { pulse.stopAnimation(); pulse.setValue(0); return; }
    AccessibilityInfo.announceForAccessibility(t("mic.a11y.live"));
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) { pulse.setValue(0.5); return; }
      loop = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]));
      loop.start();
    });
    return () => loop?.stop();
  }, [listening, pulse, t]);
  useEffect(() => { Animated.timing(volume, { toValue: listening ? level : 0, duration: 110, useNativeDriver: true }).start(); }, [level, listening, volume]);
  const busy = speaking || phase === "starting";
  const title = listening ? t("mic.listening") : phase === "starting" ? t("mic.starting") : speaking ? t("mic.speaking", { name: tutorName(prefs.voice) }) : t(idleKey);
  return <View style={p.micWrap}>
    <View style={p.micStage}>
      {listening && <Animated.View pointerEvents="none" style={[p.ring, {
        opacity: Animated.subtract(0.55, Animated.multiply(pulse, 0.3)),
        transform: [{ scale: Animated.add(1.05, Animated.add(Animated.multiply(pulse, 0.25), Animated.multiply(volume, 0.45))) }] }]} />}
      <Pressable accessibilityRole="button" accessibilityLabel={t(listening ? "mic.a11y.stop" : "mic.a11y.start")} accessibilityState={{ disabled: busy, busy }}
        disabled={busy} onPress={onPress}
        style={({ pressed }) => [p.mic, listening && { backgroundColor: theme.red }, busy && { backgroundColor: "#a9b3a1" }, { opacity: pressed ? 0.75 : 1 }]}>
        <RNText accessible={false} style={{ fontSize: 36, color: theme.cream }}>{listening ? "■" : "🎙"}</RNText>
      </Pressable>
    </View>
    <T accessibilityLiveRegion="polite" center style={[p.micTitle, listening && { color: theme.red }]}>{title}</T>
    {listening && <T v="small" center>{t("mic.hearing")}</T>}
  </View>;
}
/** Spoken answer: microphone, optional playback of a prompt, and secondary actions in one row. */
export function OralInput({ prompt, idleKey, expected, accept, onAnswer, actions }: {
  prompt?: string; idleKey: Key; expected: readonly string[]; accept: (text: string) => boolean; onAnswer: (text: string) => void; actions?: React.ReactNode;
}) {
  const { t } = useApp();
  const { say, speaking, error: playError, stop } = useSay();
  const mic = useRecognition({ expected, accept, onAnswer });
  const error = mic.error ?? playError;
  return <View style={{ gap: 12 }}>
    <Mic phase={mic.phase} level={mic.level} speaking={speaking} idleKey={idleKey} onPress={() => { stop(); void mic.toggle(); }} />
    {mic.phase === "listening" && !!mic.transcript && <T es center style={{ fontStyle: "italic" }}>„{mic.transcript}“</T>}
    {error && <T accessibilityLiveRegion="polite" center>{t(error)}</T>}
    {mic.blocked && <Button kind="secondary" onPress={() => { void Linking.openSettings(); }}>{t("err.openSettings")}</Button>}
    <Row style={{ gap: 8, alignItems: "stretch" }}>
      {!!prompt && <>
        <SpeedToggle />
        <Pill icon="♪" label={t("btn.listen")} disabled={mic.phase !== "idle"} onPress={() => { mic.cancel(); void say(prompt); }} />
      </>}
      {actions}
    </Row>
  </View>;
}
export type Result = { ok: boolean; solution?: string; meaning?: string; note?: string; heard?: string };
/** Result sheet at the bottom of the lesson, in the app's own calm colours. */
export function FeedbackBar({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const { t } = useApp();
  const [rise] = useState(() => new Animated.Value(0));
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) rise.setValue(1);
      else Animated.timing(rise, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  }, [rise]);
  const { ok } = result;
  return <Animated.View accessibilityLiveRegion="assertive" style={[p.bar, { backgroundColor: ok ? theme.pale : theme.warm,
    transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [140, 0] }) }] }]}>
    <Row>
      <View style={[p.badge, { backgroundColor: ok ? theme.green : theme.yellow }]}><RNText accessible={false} style={{ color: ok ? theme.cream : theme.green, fontSize: 22, fontWeight: "900" }}>{ok ? "✓" : "↻"}</RNText></View>
      <T v="h2" es={ok}>{ok ? "¡Muy bien!" : t("fb.almost")}</T>
    </Row>
    {!ok && !!result.heard && <T v="small">{t("fb.heard")} <T v="small" es>„{result.heard}“</T></T>}
    {!ok && !!result.solution && <><T v="small">{t("fb.solution")}</T><T es style={p.solution}>{result.solution}</T></>}
    {!!result.meaning && <T v="small">{result.meaning}</T>}
    {!!result.note && <T>{result.note}</T>}
    {!ok && <T v="small">{t("fb.again")}</T>}
    <Button onPress={onContinue}>{t("common.continue")}</Button>
  </Animated.View>;
}
export const p = StyleSheet.create({
  speed: { flexDirection: "row", backgroundColor: theme.pale, borderRadius: 16, padding: 3, minHeight: 56 },
  speedOption: { width: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  speaker: { backgroundColor: theme.green, alignItems: "center", justifyContent: "center" },
  micWrap: { alignItems: "center", gap: 6, minHeight: 176 },
  micStage: { width: 132, height: 132, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 104, height: 104, borderRadius: 52, backgroundColor: theme.red },
  mic: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.green, alignItems: "center", justifyContent: "center" },
  micTitle: { ...k.h2, fontSize: 17 },
  bar: { padding: 20, paddingBottom: 26, gap: 8, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: theme.line },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  solution: { fontSize: 18, fontWeight: "700", color: theme.green },
});
