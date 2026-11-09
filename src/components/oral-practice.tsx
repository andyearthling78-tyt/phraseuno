import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Linking, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule as Recognition, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { usePreferences } from '../lib/preferences';
import { learningSpeech } from '../lib/speech';
import { micLevel, recognitionError, recognitionOptions, SILENCE_MS } from '../lib/oral-model';
import { recognitionGate } from '../lib/recognition-gate';
import { tutorName } from '../lib/preferences-model';
import { MicIndicator, MicPhase } from './mic-indicator';
import { Button, C, s } from './ui';
import { Text } from './localized-text';

type Props = { prompt: string; onAnswer: (text: string) => void; repeat?: boolean; autoPlay?: boolean; actions?: React.ReactNode };
// Small secondary action, so the microphone stays the one obvious control.
export function Pill({ label, icon, onPress, disabled, active }: { label: string; icon?: string; onPress: () => void; disabled?: boolean; active?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => ({
    flex: 1, minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 2,
    backgroundColor: active ? C.green : C.pale, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
    {!!icon && <Text accessible={false} style={{ fontSize: 19 }}>{icon}</Text>}
    <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 11, fontWeight: '600', color: active ? C.cream : C.green }}>{label}</Text>
  </Pressable>;
}
// Hare = natural tempo, snail = slow. Changing it replays the sentence right away.
export function SpeedToggle() {
  const { preferences, update } = usePreferences();
  const slow = preferences.audioSpeed === 'slow';
  const set = (audioSpeed: 'natural' | 'slow') => { update({ audioSpeed }).catch(() => {}); };
  return <View accessibilityRole="radiogroup" style={sp.wrap}>
    {([['natural', '🐇', 'Normales Tempo'], ['slow', '🐌', 'Langsames Tempo']] as const).map(([value, icon, label]) => {
      const on = (value === 'slow') === slow;
      return <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}
        onPress={() => { if (!on) set(value); }}
        style={[sp.option, on && sp.on]}>
        <Text accessible={false} style={{ fontSize: 20 }}>{icon}</Text>
      </Pressable>;
    })}
  </View>;
}
const START_TIMEOUT = 4000;
const sp = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: C.pale, borderRadius: 16, padding: 3, minHeight: 56 },
  option: { width: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: C.yellow },
});
export function OralPractice({ prompt, onAnswer, repeat = false, autoPlay = true, actions }: Props) {
  const { selectedVoice, preferences, voicesLoading } = usePreferences();
  const [phase, setPhase] = useState<MicPhase>('idle');
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const mounted = useRef(true);
  const active = useRef(false);
  const ownsRecognition = useRef(false);
  const started = useRef(false);
  const intentionalAbort = useRef(false);
  const requestingPermission = useRef(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastText = useRef('');
  const silence = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callback = useRef(onAnswer);
  useEffect(() => { callback.current = onAnswer; }, [onAnswer]);
  const finish = useCallback(() => {
    active.current = false; clearTimeout(timer.current); clearTimeout(silence.current); setLevel(0);
    if (mounted.current) setPhase('idle');
  }, []);
  // Only abort a recognizer this exercise really started; aborting an idle
  // recognizer used to reset the shared audio session and cut speech off.
  const cancel = useCallback(() => {
    generation.current++; clearTimeout(timer.current); active.current = false;
    if (ownsRecognition.current) { intentionalAbort.current = true; ownsRecognition.current = false; Recognition.abort(); }
    void learningSpeech.stop();
  }, []);
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background' || (state === 'inactive' && !requestingPermission.current)) { cancel(); finish(); }
    });
    return () => { mounted.current = false; cancel(); sub.remove(); };
  }, [cancel, finish]);
  useFocusEffect(useCallback(() => () => { cancel(); finish(); }, [cancel, finish]));
  useSpeechRecognitionEvent('start', () => {
    if (!active.current) return;
    started.current = true; clearTimeout(timer.current); setPhase('listening');
    timer.current = setTimeout(() => {
      if (!active.current) return;
      Recognition.stop();
      timer.current = setTimeout(() => {
        if (!active.current) return;
        intentionalAbort.current = true; Recognition.abort(); finish(); setError(recognitionError('speech-timeout'));
      }, 3000);
    }, 15000);
  });
  useSpeechRecognitionEvent('volumechange', event => { if (active.current) setLevel(micLevel(event.value)); });
  useSpeechRecognitionEvent('result', event => {
    if (!active.current) return;
    const text = event.results[0]?.transcript?.trim() ?? '';
    if (!text) return;
    lastText.current = text; setTranscript(text);
    // Stop after a pause; the final text then arrives with the 'end' event.
    clearTimeout(silence.current);
    silence.current = setTimeout(() => { if (active.current) Recognition.stop(); }, SILENCE_MS);
  });
  useSpeechRecognitionEvent('end', () => {
    ownsRecognition.current = false;
    if (!active.current) return;
    finish();
    if (lastText.current) callback.current(lastText.current);
    else setError(recognitionError('no-speech'));
  });
  useSpeechRecognitionEvent('error', event => {
    if (event.error === 'aborted' && intentionalAbort.current) { intentionalAbort.current = false; return; }
    if (!active.current) return;
    finish();
    setError(recognitionError(event.error === 'aborted' ? 'interrupted' : event.error));
  });
  const listen = useCallback(async () => {
    cancel(); const token = generation.current;
    setError(''); setTranscript(''); lastText.current = '';
    if (!selectedVoice) { setPhase('idle'); setError('Bitte wähle in den Einstellungen eine verfügbare spanische Stimme.'); return; }
    setPhase('speaking');
    await recognitionGate.idle();
    if (!mounted.current || token !== generation.current) return;
    void learningSpeech.speak({ text: prompt, voice: selectedVoice,
      recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
      onDone: () => { if (mounted.current && token === generation.current) setPhase('idle'); },
      onError: () => { if (mounted.current && token === generation.current) {
        setPhase('idle'); setError('Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut.');
      } },
    });
  }, [cancel, prompt, selectedVoice, preferences.voiceGender, preferences.audioSpeed]);
  // Replay right away in the new tempo when 🐇/🐌 is switched.
  const speed = useRef(preferences.audioSpeed);
  useEffect(() => {
    if (speed.current === preferences.audioSpeed) return;
    speed.current = preferences.audioSpeed;
    if (!active.current) void listen();
  }, [preferences.audioSpeed, listen]);
  useEffect(() => {
    if (voicesLoading || !autoPlay) return;
    const scheduled = setTimeout(() => { void listen(); }, 150);
    return () => clearTimeout(scheduled);
  }, [listen, voicesLoading, autoPlay]);
  async function record() {
    if (phase === 'starting' || phase === 'speaking') return;
    if (active.current) { Recognition.stop(); return; }
    const token = ++generation.current;
    setError(''); setBlocked(false); setTranscript(''); lastText.current = ''; setPhase('starting');
    try {
      await learningSpeech.stop();
      // Only microphone access is needed for iOS on-device recognition. No network authorization.
      requestingPermission.current = true;
      const permission = await Recognition.requestMicrophonePermissionsAsync();
      requestingPermission.current = false;
      if (!mounted.current || token !== generation.current) return;
      if (!permission.granted) { setBlocked(true); finish(); setError(recognitionError('not-allowed')); return; }
      if (!Recognition.isRecognitionAvailable() || !Recognition.supportsOnDeviceRecognition()) { finish(); setError(recognitionError('unavailable')); return; }
      await recognitionGate.idle();
      if (!mounted.current || token !== generation.current) return;
      active.current = true; started.current = false; ownsRecognition.current = true; intentionalAbort.current = false;
      Recognition.start({ ...recognitionOptions, iosTaskHint: 'dictation',
        iosCategory: { ...recognitionOptions.iosCategory, categoryOptions: [...recognitionOptions.iosCategory.categoryOptions] } });
      timer.current = setTimeout(() => {
        if (!active.current || started.current) return;
        intentionalAbort.current = true; ownsRecognition.current = false; Recognition.abort();
        finish(); setError(recognitionError('interrupted'));
      }, START_TIMEOUT);
    } catch {
      requestingPermission.current = false;
      if (!mounted.current || token !== generation.current) return;
      finish(); setError(recognitionError('unavailable'));
    }
  }
  return <View style={{ gap: 12 }}>
    <MicIndicator phase={phase} level={level} tutor={tutorName(preferences.voiceGender)} repeat={repeat} onPress={() => { void record(); }} />
    {phase === 'listening' && !!transcript && <Text translate={false} accessibilityLiveRegion="polite" style={[s.body, s.center, { fontStyle: 'italic' }]}>„{transcript}“</Text>}
    {!!error && <Text accessibilityLiveRegion="polite" style={[s.body, s.center]}>{error}</Text>}
    {blocked && <Button secondary onPress={() => { void Linking.openSettings(); }}>Geräteeinstellungen öffnen</Button>}
    <View style={[s.row, { gap: 8, alignItems: 'stretch' }]}>
      <SpeedToggle />
      <Pill icon="♪" label="Hören" onPress={() => { void listen(); }} disabled={phase === 'starting' || phase === 'listening'} />
      {actions}
    </View>
  </View>;
}
