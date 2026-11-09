import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState, View } from "react-native";
import { usePreferences } from "../lib/preferences";
import { learningSpeech } from "../lib/speech";
import { Text } from "./localized-text";
import { Button, s } from "./ui";

// Step 1 of every phrase: listen only. The Spanish text stays hidden until the reading step.
export function ListenStep({ prompt, onContinue }: { prompt: string; onContinue: () => void }) {
  const { selectedVoice, preferences, voicesLoading } = usePreferences();
  const [phase, setPhase] = useState<"speaking" | "done" | "error">("speaking");
  const [heard, setHeard] = useState(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  const halt = useCallback(() => { generation.current++; void learningSpeech.stop(); }, []);
  const play = useCallback(() => {
    const token = ++generation.current;
    if (!selectedVoice) { setPhase("error"); return; }
    setPhase("speaking");
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
  useEffect(() => {
    if (voicesLoading) return;
    const scheduled = setTimeout(play, 150);
    return () => clearTimeout(scheduled);
  }, [play, voicesLoading]);
  const tutor = preferences.voiceGender === "male" ? "Mateo" : "Lucía";
  return <View style={{ gap: 12 }}>
    <Text accessibilityLiveRegion="polite" style={[s.body, s.center]}>
      {phase === "speaking" ? (tutor === "Mateo" ? "Mateo spricht. Hör genau hin …" : "Lucía spricht. Hör genau hin …")
        : phase === "error" ? (selectedVoice ? "Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut." : "Bitte wähle in den Einstellungen eine verfügbare spanische Stimme.")
        : "Gut zugehört. Du kannst den Satz so oft hören, wie du möchtest."}
    </Text>
    <Button secondary onPress={play} disabled={phase === "speaking"}>♪ Noch einmal hören</Button>
    <Button onPress={() => { halt(); onContinue(); }} disabled={!heard && phase !== "error"}>Jetzt nachsprechen →</Button>
  </View>;
}
