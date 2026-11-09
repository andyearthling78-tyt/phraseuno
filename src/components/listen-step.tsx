import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState, View } from "react-native";
import { usePreferences } from "../lib/preferences";
import { learningSpeech } from "../lib/speech";
import { recognitionGate } from "../lib/recognition-gate";
import { Text } from "./localized-text";
import { Button, s } from "./ui";
import { Pill, SpeedToggle } from "./oral-practice";

// Step 1 of every phrase: listen only. The Spanish text stays hidden until the reading step.
export function ListenStep({ prompt, onContinue }: { prompt: string; onContinue: () => void }) {
  const { selectedVoice, preferences, voicesLoading } = usePreferences();
  const [phase, setPhase] = useState<"speaking" | "done" | "error">("speaking");
  const [heard, setHeard] = useState(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const halt = useCallback(() => { generation.current++; void learningSpeech.stop(); }, []);
  const play = useCallback(async () => {
    const token = ++generation.current;
    if (!selectedVoice) { setPhase("error"); return; }
    setPhase("speaking");
    await recognitionGate.idle();
    if (!mounted.current || token !== generation.current) return;
    void learningSpeech.speak({
      text: prompt, voice: selectedVoice,
      recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
      onDone: () => { if (mounted.current && token === generation.current) { setPhase("done"); setHeard(true); } },
      onError: () => { if (mounted.current && token === generation.current) setPhase("error"); },
    });
  }, [prompt, selectedVoice, preferences.voiceGender, preferences.audioSpeed]);
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") { halt(); if (mounted.current) setPhase("done"); }
    });
    return () => { mounted.current = false; halt(); sub.remove(); };
  }, [halt]);
  useFocusEffect(useCallback(() => () => { halt(); }, [halt]));
  const speed = useRef(preferences.audioSpeed);
  useEffect(() => {
    if (speed.current === preferences.audioSpeed) return;
    speed.current = preferences.audioSpeed;
    void play();
  }, [preferences.audioSpeed, play]);
  useEffect(() => {
    if (voicesLoading) return;
    const scheduled = setTimeout(() => { void play(); }, 150);
    return () => clearTimeout(scheduled);
  }, [play, voicesLoading]);
  const tutor = preferences.voiceGender === "male" ? "Mateo" : "Lucía";
  return <View style={{ gap: 12 }}>
    <Text accessibilityLiveRegion="polite" style={[s.h2, s.center]}>
      {phase === "speaking" ? (tutor === "Mateo" ? "🔊 Mateo spricht …" : "🔊 Lucía spricht …")
        : phase === "error" ? (selectedVoice ? "Die Stimme konnte nicht abgespielt werden." : "Bitte wähle in den Einstellungen eine spanische Stimme.")
        : "Gut zugehört."}
    </Text>
    <Button onPress={() => { halt(); onContinue(); }} disabled={!heard && phase !== "error"}>🎙 Jetzt nachsprechen →</Button>
    <View style={[s.row, { gap: 8, alignItems: "stretch" }]}><SpeedToggle /><Pill icon="♪" label="Nochmal hören" onPress={() => { void play(); }} disabled={phase === "speaking"} /></View>
  </View>;
}
