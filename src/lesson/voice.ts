import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { ExpoSpeechRecognitionModule as Recognition, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { speechRate } from "../domain/prefs";
import { recognitionGate, speech } from "../services/speech";
import { MAX_LISTEN_MS, micLevel, recognitionOptions, SILENCE_MS, START_TIMEOUT_MS } from "../services/sequencer";
import { useApp } from "../state/app";
import type { Key } from "../i18n/de";

/** Speaks Spanish with the chosen tutor voice and tempo. Only ever starts on a user action. */
export function useSay() {
  const { voice, prefs, course } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<Key | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; void speech.stop(); }; }, []);
  const say = useCallback(async (text: string) => {
    if (!voice) { setError("err.noVoice"); return; }
    setError(null); setSpeaking(true);
    await recognitionGate.idle();
    if (!alive.current) return;
    const end = () => { if (alive.current) setSpeaking(false); };
    void speech.speak({ text, voice: voice.identifier, language: voice.language || course.speechLocale, rate: speechRate(prefs.speed),
      onDone: end, onError: () => { end(); if (alive.current) setError("err.play"); } });
  }, [voice, prefs.speed, course.speechLocale]);
  const stop = useCallback(() => { setSpeaking(false); void speech.stop(); }, []);
  return { say, stop, speaking, error };
}

export type MicPhase = "idle" | "starting" | "listening";
type Options = { expected: readonly string[]; accept: (text: string) => boolean; onAnswer: (text: string) => void };
/** On-device Spanish recognition for one exercise. Stops after a pause, on leaving, and in the background. */
export function useRecognition({ expected, accept, onAnswer }: Options) {
  const { course } = useApp();
  const [phase, setPhase] = useState<MicPhase>("idle");
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<Key | null>(null);
  const [blocked, setBlocked] = useState(false);
  const ref = useRef({ active: false, started: false, owns: false, intentional: false, asking: false, generation: 0, last: "", alternatives: [] as string[], mounted: true });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const silence = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handlers = useRef({ accept, onAnswer });
  useEffect(() => { handlers.current = { accept, onAnswer }; });
  const finish = useCallback(() => {
    ref.current.active = false; clearTimeout(timer.current); clearTimeout(silence.current);
    if (ref.current.mounted) { setLevel(0); setPhase("idle"); }
  }, []);
  // Abort only a recogniser this exercise started: aborting an idle one would reset the shared audio session.
  const cancel = useCallback(() => {
    const r = ref.current; r.generation++;
    if (r.owns) { r.intentional = true; r.owns = false; Recognition.abort(); }
    finish();
  }, [finish]);
  useEffect(() => {
    const r = ref.current; r.mounted = true;
    const sub = AppState.addEventListener("change", (state) => { if (state === "background" || (state === "inactive" && !r.asking)) cancel(); });
    return () => { r.mounted = false; cancel(); sub.remove(); };
  }, [cancel]);
  useFocusEffect(useCallback(() => () => cancel(), [cancel]));
  useSpeechRecognitionEvent("start", () => {
    const r = ref.current; if (!r.active) return;
    r.started = true; clearTimeout(timer.current); setPhase("listening");
    timer.current = setTimeout(() => { if (r.active) Recognition.stop(); }, MAX_LISTEN_MS);
  });
  useSpeechRecognitionEvent("volumechange", (event) => { if (ref.current.active) setLevel(micLevel(event.value)); });
  useSpeechRecognitionEvent("result", (event) => {
    const r = ref.current; if (!r.active) return;
    const text = event.results[0]?.transcript?.trim() ?? "";
    if (!text) return;
    r.last = text; r.alternatives = event.results.map((result) => result.transcript.trim()).filter(Boolean); setTranscript(text);
    clearTimeout(silence.current);
    silence.current = setTimeout(() => { if (r.active) Recognition.stop(); }, SILENCE_MS);
  });
  useSpeechRecognitionEvent("end", () => {
    const r = ref.current; r.owns = false;
    if (!r.active) return;
    finish();
    // Prefer an alternative transcript that is a correct answer over the top guess.
    if (r.last) handlers.current.onAnswer(r.alternatives.find((text) => handlers.current.accept(text)) ?? r.last);
    else setError("err.mic.nospeech");
  });
  useSpeechRecognitionEvent("error", (event) => {
    const r = ref.current;
    if (event.error === "aborted" && r.intentional) { r.intentional = false; return; }
    if (!r.active) return;
    finish();
    setError(event.error === "not-allowed" || event.error === "service-not-allowed" ? "err.mic.denied"
      : event.error === "no-speech" || event.error === "speech-timeout" ? "err.mic.nospeech"
      : event.error === "aborted" ? "err.mic.interrupted" : "err.mic.unavailable");
  });
  const toggle = useCallback(async () => {
    const r = ref.current;
    if (r.active) { if (r.started) Recognition.stop(); return; }
    const token = ++r.generation;
    setError(null); setBlocked(false); setTranscript(""); r.last = ""; r.alternatives = []; setPhase("starting");
    try {
      await speech.stop();
      r.asking = true;
      const permission = await Recognition.requestMicrophonePermissionsAsync();
      r.asking = false;
      if (!r.mounted || token !== r.generation) return;
      if (!permission.granted) { setBlocked(true); finish(); setError("err.mic.denied"); return; }
      if (!Recognition.isRecognitionAvailable() || !Recognition.supportsOnDeviceRecognition()) { finish(); setError("err.mic.unavailable"); return; }
      await recognitionGate.idle();
      if (!r.mounted || token !== r.generation) return;
      r.active = true; r.started = false; r.owns = true; r.intentional = false;
      Recognition.start(recognitionOptions(course.speechLocale, expected));
      timer.current = setTimeout(() => {
        if (!r.active || r.started) return;
        r.intentional = true; r.owns = false; Recognition.abort(); finish(); setError("err.mic.interrupted");
      }, START_TIMEOUT_MS);
    } catch {
      r.asking = false;
      if (r.mounted && token === r.generation) { finish(); setError("err.mic.unavailable"); }
    }
  }, [course.speechLocale, expected, finish]);
  return { phase, level, transcript, error, blocked, toggle, cancel };
}
