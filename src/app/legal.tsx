import React from "react";
import { useLocalSearchParams } from "expo-router";
import { LEGAL_VERSION, privacy, terms } from "../content/legal";
import { provider } from "../content/provider";
import { useApp } from "../state/app";
import { Card, Screen, T } from "../ui/kit";
export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const { t, l } = useApp();
  if (doc === "privacy" || doc === "terms") {
    return <Screen title={t(doc === "privacy" ? "legal.privacy" : "legal.terms")}>
      {(doc === "privacy" ? privacy : terms).map((section) => <Card key={section.title.de} style={{ gap: 8 }}>
        <T v="h2">{l(section.title)}</T><T>{l(section.text)}</T>
      </Card>)}
      <T v="small" center>{LEGAL_VERSION}</T>
    </Screen>;
  }
  return <Screen title={t("legal.imprint")}>
    <Card style={{ gap: 4 }}>
      <T v="h2">{provider.name}</T>
      <T>{provider.street}</T><T>{provider.city}</T><T>{l(provider.country)}</T>
      <T>{provider.phone}</T>
      {provider.email ? <T>{provider.email}</T> : null}
      {provider.vatId ? <T>USt-IdNr.: {provider.vatId}</T> : null}
      {(!provider.email || !provider.vatId) && <T v="small">{t("legal.missing")}</T>}
    </Card>
  </Screen>;
}
