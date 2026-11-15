import React from "react";
import type { Key } from "../i18n/de";
import { useApp } from "../state/app";
import { Card, Screen, T } from "../ui/kit";
// The learning principles behind the app, each with its research source.
export default function Method() {
  const { t } = useApp();
  return <Screen title={t("method.title")}>
    <T>{t("method.intro")}</T>
    {([1, 2, 3, 4, 5] as const).map((n) => <Card key={n} style={{ gap: 6 }}>
      <T v="h2">{t(`method.${n}` as Key)}</T><T>{t(`method.${n}s` as Key)}</T>
    </Card>)}
    <T v="small">{t("method.note")}</T>
  </Screen>;
}
