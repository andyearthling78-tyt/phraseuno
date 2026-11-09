import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useI18n } from "../../lib/i18n";
import { usePreferences } from "../../lib/preferences";
import { learningSpeech } from "../../lib/speech";
import { useSay } from "../../lib/use-say";
import { Text } from "../localized-text";
import { SpeedToggle } from "../oral-practice";
import { C } from "../ui";
// Big speaker button with hare/snail tempo; plays once on entry and again on tempo change.
export function Speaker({ text, auto = true, size = 84 }: { text: string; auto?: boolean; size?: number }) {
  const { t } = useI18n();
  const say = useSay();
  const { voicesLoading, preferences } = usePreferences();
  const [playing, setPlaying] = useState(false);
  const play = React.useCallback(() => { setPlaying(true); void say(text, () => setPlaying(false)).then((ok) => { if (!ok) setPlaying(false); }); }, [say, text]);
  const started = useRef(false);
  useEffect(() => {
    if (!auto || voicesLoading || started.current) return;
    started.current = true;
    const timer = setTimeout(play, 250);
    return () => clearTimeout(timer);
  }, [auto, voicesLoading, play]);
  const speed = useRef(preferences.audioSpeed);
  useEffect(() => {
    if (speed.current === preferences.audioSpeed) return;
    speed.current = preferences.audioSpeed; play();
  }, [preferences.audioSpeed, play]);
  useEffect(() => () => { void learningSpeech.stop(); }, []);
  return <View style={sp.row}>
    <Pressable accessibilityRole="button" accessibilityLabel={t("Anhören")} onPress={play}
      style={({ pressed }) => [sp.button, { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.75 : 1 }, playing && sp.playing]}>
      <Text accessible={false} style={{ fontSize: size * 0.4, color: C.cream }}>♪</Text>
    </Pressable>
    <SpeedToggle />
  </View>;
}
const sp = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  button: { backgroundColor: C.green, alignItems: "center", justifyContent: "center" },
  playing: { backgroundColor: "#2c5a49" },
});
