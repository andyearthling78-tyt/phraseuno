import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Linking, View } from 'react-native';
import { ExpoSpeechRecognitionModule as Recognition, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useI18n } from '../lib/i18n';
import { usePreferences } from '../lib/preferences';
import { learningSpeech } from '../lib/speech';
import { recognitionError, recognitionOptions } from '../lib/oral-model';
import { Button, s } from './ui';
import { Text } from './localized-text';

type Props = { prompt: string; onAnswer: (text: string) => void; repeat?: boolean; autoPlay?: boolean };
export function OralPractice({ prompt, onAnswer, repeat = false, autoPlay = true }: Props) {
  const { t } = useI18n();
  const { selectedVoice, preferences, voicesLoading } = usePreferences();
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'starting' | 'listening'>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const mounted = useRef(true);
  const active = useRef(false);
  const requestingPermission = useRef(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastText = useRef('');
  const callback = useRef(onAnswer);
  useEffect(() => { callback.current = onAnswer; }, [onAnswer]);
  const cancel = useCallback(() => {
    generation.current++; active.current = false; clearTimeout(timer.current);
    Recognition.abort(); void learningSpeech.stop();
  }, []);
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background' || (state === 'inactive' && !requestingPermission.current)) { cancel(); if (mounted.current) setPhase('idle'); }
    });
    return () => { mounted.current = false; cancel(); sub.remove(); };
  }, [cancel]);
  useFocusEffect(useCallback(() => () => { cancel(); setPhase('idle'); }, [cancel]));
  useSpeechRecognitionEvent('result', event => {
    if (!active.current) return;
    const text = event.results[0]?.transcript?.trim() ?? '';
    lastText.current = text; setTranscript(text);
    if (event.isFinal && text) {
      active.current = false; clearTimeout(timer.current); setPhase('idle');
      callback.current(text);
    }
  });
  useSpeechRecognitionEvent('end', () => {
    if (!active.current) return;
    active.current = false; clearTimeout(timer.current); setPhase('idle');
    if (lastText.current) callback.current(lastText.current);
    else setError('Ich habe nichts verstanden. Sprich nach dem Start deutlich ins Mikrofon und versuche es noch einmal.');
  });
  useSpeechRecognitionEvent('error', event => {
    if (!active.current) return;
    active.current = false; clearTimeout(timer.current); setPhase('idle');
    if (event.error !== 'aborted') setError(recognitionError(event.error));
  });
  const listen = useCallback(() => {
    cancel(); const token = generation.current;
    setError(''); setTranscript(''); lastText.current = '';
    if (!selectedVoice) {
      setPhase('idle'); setError('Bitte wähle in den Einstellungen eine verfügbare spanische Stimme.'); return;
    }
    setPhase('speaking');
    void learningSpeech.speak({ text: prompt, voice: selectedVoice,
      recording: { voice: preferences.voiceGender, speed: preferences.audioSpeed },
      onDone: () => { if (mounted.current && token === generation.current) setPhase('idle'); },
      onError: () => { if (mounted.current && token === generation.current) {
        setPhase('idle'); setError('Die Stimme konnte nicht abgespielt werden. Prüfe die Medienlautstärke und das gewählte Audiogerät und versuche es erneut.');
      } },
    });
  }, [cancel, prompt, selectedVoice, preferences.voiceGender, preferences.audioSpeed]);
  useEffect(() => {
    if (voicesLoading || !autoPlay) return;
    const scheduled = setTimeout(listen, 150);
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
      if (!permission.granted) {
        setBlocked(true); setPhase('idle'); setError(recognitionError('not-allowed')); return;
      }
      if (!Recognition.isRecognitionAvailable() || !Recognition.supportsOnDeviceRecognition()) {
        setPhase('idle'); setError(recognitionError('unavailable')); return;
      }
      active.current = true; setPhase('listening');
      Recognition.start({ ...recognitionOptions, iosTaskHint: 'dictation' });
      timer.current = setTimeout(() => {
        if (!active.current) return;
        Recognition.stop();
        timer.current = setTimeout(() => {
          if (!active.current) return;
          active.current = false; Recognition.abort(); setPhase('idle'); setError(recognitionError('speech-timeout'));
        }, 3000);
      }, 18000);
    } catch {
      requestingPermission.current = false;
      if (!mounted.current || token !== generation.current) return;
      active.current = false; setPhase('idle'); setError(recognitionError('unavailable'));
    }
  }
  return <View style={{ gap: 12 }}>
    <Text style={[s.body, s.center]}>{phase === 'speaking' ? (preferences.voiceGender === 'male' ? 'Mateo spricht. Hör erst einmal zu …' : 'Lucía spricht. Hör erst einmal zu …') : phase === 'listening' ? 'Ich höre zu …' : repeat ? 'Jetzt du: Sprich den Satz nach.' : 'Jetzt du: Antworte auf Spanisch.'}</Text>
    <Button secondary onPress={listen} disabled={phase === 'starting'}>♪ Noch einmal hören</Button>
    <Button onPress={record} disabled={phase === 'starting' || phase === 'speaking'}>
      {phase === 'listening' ? '■ Aufnahme beenden' : phase === 'starting' ? 'Mikrofon wird vorbereitet …' : repeat ? '🎙 Satz nachsprechen' : '🎙 Antwort sprechen'}
    </Button>
    {!!transcript && <View accessibilityLiveRegion="polite" style={s.note}><Text style={s.small}>So habe ich dich verstanden:</Text><Text translate={false} style={s.body}>{transcript}</Text></View>}
    {!!error && <Text accessibilityLiveRegion="polite" style={s.body}>{error}</Text>}
    {blocked && <Button secondary onPress={() => { void Linking.openSettings(); }}>Geräteeinstellungen öffnen</Button>}
    <Text style={s.small}>{t('Erkennung auf dem Gerät. Keine gespeicherte Tondatei. Geprüft werden erkannte Wörter, nicht deine Aussprache.')}</Text>
  </View>;
}
