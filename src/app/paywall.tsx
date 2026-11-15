import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { router } from "expo-router";
import type { Key } from "../i18n/de";
import { buy, loadPlans, purchasesConfigured, restorePurchases } from "../services/purchases";
import type { Plan } from "../services/purchases";
import { useApp } from "../state/app";
import { Button, Card, k, Row, Screen, T } from "../ui/kit";
import { theme } from "../ui/theme";

const LABEL: Record<Plan["id"], [Key, Key]> = { annual: ["pay.annual", "pay.perYear"], monthly: ["pay.monthly", "pay.perMonth"], lifetime: ["pay.lifetime", "pay.once"] };
// Premium offer: store prices, clear renewal terms, restore, and links to the legal texts.
export default function Paywall() {
  const { t, premium } = useApp();
  const [plans, setPlans] = useState<Plan[] | null>(purchasesConfigured ? null : []);
  const [pick, setPick] = useState<Plan["id"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Key | null>(null);
  useEffect(() => {
    if (!purchasesConfigured) return;
    loadPlans().then((found) => { setPlans(found); setPick(found[0]?.id ?? null); }).catch(() => setPlans([]));
  }, []);
  async function run(action: () => Promise<Key | null>) {
    setBusy(true); setMessage(null);
    try { setMessage(await action()); } catch { setMessage("pay.error"); } finally { setBusy(false); }
  }
  const chosen = plans?.find((plan) => plan.id === pick);
  return <Screen title="Premium">
    <View style={k.hero}>
      <T style={{ color: theme.cream, fontSize: 25, lineHeight: 31, fontWeight: "800" }}>{t("pay.title")}</T>
      <T style={{ color: theme.onGreen }}>{t("pay.sub")}</T>
    </View>
    <Card style={{ gap: 10 }}>
      {(["pay.b1", "pay.b2", "pay.b3"] as const).map((key) => <Row key={key} style={{ alignItems: "flex-start" }}>
        <T accessible={false} style={{ color: theme.green, fontWeight: "900" }}>✓</T><T style={{ flex: 1 }}>{t(key)}</T>
      </Row>)}
    </Card>
    {premium ? <Card><T v="h2">{t("premium.active")}</T><T>{t("premium.active.sub")}</T><Button onPress={() => router.replace("/")}>{t("common.continue")}</Button></Card>
      : plans === null ? <Row style={{ justifyContent: "center" }}><ActivityIndicator color={theme.green} /><T>{t("pay.loading")}</T></Row>
      : !plans.length ? <Card><T>{t("pay.unavailable")}</T></Card>
      : <>
        {plans.map((plan) => <Pressable key={plan.id} accessibilityRole="radio" accessibilityState={{ checked: pick === plan.id }} onPress={() => setPick(plan.id)}
          style={[k.choice, { paddingVertical: 16 }, pick === plan.id && { borderColor: theme.green, borderWidth: 2, backgroundColor: theme.pale }]}>
          <View style={{ flex: 1 }}><T v="h2">{t(LABEL[plan.id][0])}</T><T v="small">{plan.price} {t(LABEL[plan.id][1])}</T></View>
          <T accessible={false} style={{ color: theme.green }}>{pick === plan.id ? "●" : "○"}</T>
        </Pressable>)}
        <Button disabled={!chosen || busy} onPress={() => { if (chosen) void run(async () => ((await buy(chosen)) === "purchased" ? "pay.success" : null)); }}>
          {chosen ? `${t("pay.buy")} · ${chosen.price}` : t("pay.buy")}
        </Button>
        <T v="small" center>{t("pay.renew")}</T>
      </>}
    {message && <T accessibilityLiveRegion="polite" center>{t(message)}</T>}
    {!premium && <Button kind="ghost" disabled={busy || !purchasesConfigured} onPress={() => void run(async () => ((await restorePurchases()) ? "restore.ok" : "restore.none"))}>{t("set.restore")}</Button>}
    <Row style={{ justifyContent: "center", gap: 18 }}>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/legal", params: { doc: "terms" } })}><T v="small" style={{ textDecorationLine: "underline" }}>{t("legal.terms")}</T></Pressable>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/legal", params: { doc: "privacy" } })}><T v="small" style={{ textDecorationLine: "underline" }}>{t("legal.privacy")}</T></Pressable>
    </Row>
  </Screen>;
}
