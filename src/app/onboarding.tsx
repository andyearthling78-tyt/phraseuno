import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { tutorName } from "../domain/prefs";
import type { Key } from "../i18n/de";
import { reminderAllowed } from "../services/reminders";
import { useApp } from "../state/app";
import { Button, Card, Choice, k, Row, Screen, T } from "../ui/kit";
import { theme } from "../ui/theme";
// Three short steps: who we are and how it works, the tutor voice, an optional reminder.
export default function Onboarding() {
  const { t, prefs, setPrefs } = useApp();
  const [step, setStep] = useState(0);
  const finish = (reminder: boolean) => { setPrefs({ onboarded: true, reminder }); router.replace("/"); };
  const male = prefs.voice === "male";
  return <Screen>
    <View style={[k.hero, { alignItems: "center", paddingVertical: 28 }]}>
      <T accessible={false} style={{ fontSize: 52, lineHeight: 66 }}>{male ? "👨🏽" : "👩🏽"}</T>
      <T es center style={{ color: theme.cream, fontSize: 26, fontWeight: "800" }}>{t("ob.hello").replace("Lucía", tutorName(prefs.voice))}</T>
      <T center style={{ color: theme.onGreen }}>{t("ob.sub")}</T>
    </View>
    {step === 0 && <>
      {([1, 2, 3] as const).map((n) => <Card key={n} style={{ gap: 2, paddingVertical: 14 }}>
        <T v="h2">{t(`ob.m${n}` as Key)}</T><T v="small">{t(`ob.m${n}s` as Key)}</T>
      </Card>)}
      <Button onPress={() => setStep(1)}>{t("common.continue")}</Button>
      <T v="small" center>{t("ob.age")}</T>
    </>}
    {step === 1 && <Card>
      <T v="h2">{t("ob.voice")}</T>
      <Choice label={t("voice.female")} selected={!male} onPress={() => setPrefs({ voice: "female", voiceId: null })} />
      <Choice label={t("voice.male")} selected={male} onPress={() => setPrefs({ voice: "male", voiceId: null })} />
      <Button onPress={() => setStep(2)}>{t("common.continue")}</Button>
    </Card>}
    {step === 2 && <Card>
      <T v="h2">{t("ob.reminder")}</T>
      <Row>
        <Button kind="secondary" style={{ flex: 1 }} onPress={() => finish(false)}>{t("ob.reminder.no")}</Button>
        <Button style={{ flex: 1 }} onPress={async () => finish(await reminderAllowed(true).catch(() => false))}>{t("ob.reminder.yes")}</Button>
      </Row>
    </Card>}
  </Screen>;
}
