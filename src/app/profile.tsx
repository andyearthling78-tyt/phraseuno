import React, { useState } from "react";
import { Alert, Linking, Platform, Pressable, Switch, TextInput, View } from "react-native";
import { router } from "expo-router";
import { allDays } from "../domain/types";
import { isEnhanced, validTime } from "../domain/prefs";
import { dayDone } from "../domain/progress";
import type { Key } from "../i18n/de";
import { SpeedToggle } from "../lesson/parts";
import { useSay } from "../lesson/voice";
import { purchasesConfigured, restorePurchases } from "../services/purchases";
import { reminderAllowed } from "../services/reminders";
import { useApp } from "../state/app";
import { Button, Card, Choice, k, Row, Screen, T } from "../ui/kit";
import { theme } from "../ui/theme";

const PREVIEW = "Hola. Quiero un café con leche, por favor.";
export default function Profile() {
  const app = useApp();
  const { t, prefs, setPrefs, progress, course, premium, voice, voices, voicesLoading, reminderState } = app;
  const { say, error: playError } = useSay();
  const [showVoices, setShowVoices] = useState(false);
  const [time, setTime] = useState(prefs.reminderTime);
  const [note, setNote] = useState<Key | null>(null);
  const doneDays = allDays(course).filter((day) => dayDone(progress, day.id)).length;
  const spanish = voices.filter((v) => v.language.toLowerCase().startsWith(course.speechLocale.split("-")[0]));
  const link = (label: Key, onPress: () => void) => <Pressable accessibilityRole="link" onPress={onPress} style={{ paddingVertical: 10, minHeight: 44, justifyContent: "center" }}>
    <T style={{ color: theme.green, fontWeight: "600" }}>{t(label)} →</T>
  </Pressable>;
  return <Screen tabs>
    <T v="title">{t("profile.title")}</T>
    <Row>
      {([[progress.xp, "profile.total"], [doneDays, "profile.days"], [doneDays * 4, "profile.phrases"]] as const).map(([value, label]) =>
        <View key={label} style={{ flex: 1, backgroundColor: theme.pale, borderRadius: 13, paddingVertical: 14, alignItems: "center", gap: 4 }}>
          <T style={{ fontSize: 22, fontWeight: "700", color: theme.green }}>{value}</T><T v="small" center>{t(label)}</T>
        </View>)}
    </Row>

    {premium ? <Card style={{ gap: 4 }}><T v="h2">✦ {t("premium.active")}</T><T v="small">{t("premium.active.sub")}</T></Card>
      : <View style={k.hero}>
        <T style={{ color: theme.cream, fontSize: 20, fontWeight: "800" }}>{t("premium.cta")}</T>
        <T style={{ color: theme.onGreen }}>{t("premium.cta.sub")}</T>
        <Button kind="accent" onPress={() => router.push("/paywall")}>{t("home.premium.cta")} ↗</Button>
      </View>}

    <Card>
      <T v="h2">{t("set.voice")}</T>
      <Choice label={t("voice.female")} selected={prefs.voice === "female"} onPress={() => setPrefs({ voice: "female", voiceId: null })} />
      <Choice label={t("voice.male")} selected={prefs.voice === "male"} onPress={() => setPrefs({ voice: "male", voiceId: null })} />
      {voicesLoading ? null : voice ? <>
        <T v="small">{t("voice.active", { name: voice.name, quality: t(isEnhanced(voice) ? "voice.enhanced" : "voice.standard") })}</T>
        {!isEnhanced(voice) && <View style={k.note}><T v="small">{t(Platform.OS === "ios" ? "voice.tip.ios" : "voice.tip.android")}</T></View>}
      </> : <T>{t("voice.none")}</T>}
      <Row style={{ alignItems: "stretch" }}>
        <SpeedToggle />
        <Button kind="secondary" style={{ flex: 1 }} disabled={!voice} onPress={() => { void say(PREVIEW); }}>♪ {t("voice.preview")}</Button>
      </Row>
      {playError && <T v="small">{t(playError)}</T>}
      {!voicesLoading && spanish.length > 0 && <Button kind="ghost" onPress={() => setShowVoices((v) => !v)}>{t("voice.all")} {showVoices ? "▴" : "▾"}</Button>}
      {showVoices && spanish.map((v) => <Row key={v.identifier} style={{ borderTopWidth: 1, borderColor: theme.line, paddingTop: 10 }}>
        <T style={{ flex: 1 }}>{v.name} · {v.language}</T>
        <Button kind={voice?.identifier === v.identifier ? "primary" : "secondary"} onPress={() => setPrefs({ voiceId: v.identifier })}>{t(voice?.identifier === v.identifier ? "voice.chosen" : "voice.choose")}</Button>
      </Row>)}
    </Card>

    <Card>
      <Row>
        <T v="h2" style={{ flex: 1 }}>{t("set.reminder")}</T>
        <Switch accessibilityLabel={t("set.reminder")} value={prefs.reminder} trackColor={{ false: theme.line, true: theme.green }} thumbColor={theme.paper}
          onValueChange={async (enabled) => {
            if (enabled && !(await reminderAllowed(true).catch(() => false))) { setNote("reminder.blocked"); return; }
            setNote(null); setPrefs({ reminder: enabled });
          }} />
      </Row>
      {prefs.reminder && <Row>
        <TextInput value={time} onChangeText={setTime} accessibilityLabel={t("reminder.time")} placeholder="19:00" maxLength={5} keyboardType="numbers-and-punctuation"
          autoCorrect={false} style={[k.body, { flex: 1, borderWidth: 1, borderColor: theme.line, borderRadius: 12, padding: 12, fontSize: 18, color: theme.green, backgroundColor: theme.paper }]} />
        <Button kind="secondary" disabled={time === prefs.reminderTime} onPress={() => { if (validTime(time)) { setNote(null); setPrefs({ reminderTime: time }); } else setNote("reminder.invalid"); }}>{t("reminder.save")}</Button>
      </Row>}
      {(note || reminderState === "blocked") && <T v="small">{t(note ?? "reminder.blocked")}</T>}
      {reminderState === "blocked" && <Button kind="ghost" onPress={() => { void Linking.openSettings(); }}>{t("err.openSettings")}</Button>}
    </Card>

    <Card>
      <T v="h2">{t("set.language")}</T>
      {([["system", t("lang.system")], ["de", "Deutsch"], ["en", "English"]] as const).map(([value, label]) =>
        <Choice key={value} label={label} selected={prefs.language === value} onPress={() => setPrefs({ language: value })} />)}
    </Card>

    <Card style={{ gap: 0 }}>
      {link("set.method", () => router.push("/method"))}
      {link("legal.privacy", () => router.push({ pathname: "/legal", params: { doc: "privacy" } }))}
      {link("legal.terms", () => router.push({ pathname: "/legal", params: { doc: "terms" } }))}
      {link("legal.imprint", () => router.push({ pathname: "/legal", params: { doc: "imprint" } }))}
      {purchasesConfigured && link("set.restore", () => { restorePurchases().then((ok) => Alert.alert(t(ok ? "restore.ok" : "restore.none")), () => Alert.alert(t("restore.error"))); })}
    </Card>
    {app.saveError && <T v="small" center>{t("save.error")}</T>}
    {__DEV__ && <Row><T style={{ flex: 1 }}>{t("premium.dev")}</T><Switch value={premium} onValueChange={app.setDevPremium} /></Row>}
    <Button kind="ghost" onPress={() => Alert.alert(t("reset.title"), t("reset.body"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("reset.confirm"), style: "destructive", onPress: () => { app.resetProgress().catch(() => Alert.alert(t("save.error"))); } },
    ])}><T style={{ color: theme.red, fontWeight: "600" }}>{t("set.reset")}</T></Button>
  </Screen>;
}
