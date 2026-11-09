import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useI18n } from '../lib/i18n';
import { Text } from './localized-text';
import { C } from './ui';

export type MicPhase = 'idle' | 'speaking' | 'starting' | 'listening';
const RED = '#c8402f';
type Props = { phase: MicPhase; level: number; tutor: string; repeat: boolean; onPress: () => void };
// Large, unmistakable microphone: red and pulsing while the app is really listening.
export function MicIndicator({ phase, level, tutor, repeat, onPress }: Props) {
  const { t } = useI18n();
  const [pulse] = useState(() => new Animated.Value(0));
  const [volume] = useState(() => new Animated.Value(0));
  const reduced = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { reduced.current = value; });
  }, []);
  useEffect(() => {
    if (phase !== 'listening') { pulse.stopAnimation(); pulse.setValue(0); return; }
    AccessibilityInfo.announceForAccessibility(t('Aufnahme läuft. Jetzt sprechen.'));
    if (reduced.current) { pulse.setValue(0.5); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [phase, pulse, t]);
  useEffect(() => {
    Animated.timing(volume, { toValue: phase === 'listening' ? level : 0, duration: 110, useNativeDriver: true }).start();
  }, [level, phase, volume]);
  const listening = phase === 'listening';
  const busy = phase === 'speaking' || phase === 'starting';
  const ring = Animated.add(Animated.multiply(pulse, 0.25), Animated.multiply(volume, 0.45));
  const title = listening ? '● Jetzt sprechen!' : phase === 'starting' ? 'Mikrofon startet …' : phase === 'speaking' ? `🔊 ${tutor} spricht …` : repeat ? 'Tippe aufs Mikrofon und sprich nach' : 'Tippe aufs Mikrofon und antworte';
  const hint = listening ? 'Ich höre zu …' : '';
  return <View style={m.wrap}>
    <View style={m.stage}>
      {listening && <Animated.View pointerEvents="none" style={[m.ring, {
        opacity: Animated.subtract(0.55, Animated.multiply(pulse, 0.3)),
        transform: [{ scale: Animated.add(1.05, ring) }],
      }]} />}
      <Pressable accessibilityRole="button"
        accessibilityLabel={t(listening ? 'Aufnahme beenden' : repeat ? 'Satz nachsprechen' : 'Antwort sprechen')}
        accessibilityState={{ disabled: busy, busy }}
        disabled={busy} onPress={onPress}
        style={({ pressed }) => [m.mic, listening && m.micLive, busy && m.micBusy, { opacity: pressed ? 0.75 : 1 }]}>
        <Text accessible={false} style={m.icon}>{listening ? '■' : '🎙'}</Text>
      </Pressable>
    </View>
    <Text accessibilityLiveRegion="polite" style={[m.title, listening && { color: RED }]}>{title}</Text>
    {!!hint && <Text style={m.hint}>{hint}</Text>}
  </View>;
}
const m = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, minHeight: 180 },
  stage: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 104, height: 104, borderRadius: 52, backgroundColor: RED },
  mic: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  micLive: { backgroundColor: RED },
  micBusy: { backgroundColor: '#a9b3a1' },
  icon: { fontSize: 38, color: C.cream },
  title: { fontSize: 18, fontWeight: '700', color: C.green, textAlign: 'center' },
  hint: { fontSize: 13, color: C.muted, textAlign: 'center' },
});
