import React from "react";
import { View } from "react-native";
import { learnedWords } from "../domain/progress";
import { Speaker } from "../lesson/parts";
import { useApp } from "../state/app";
import { Card, Row, Screen, T } from "../ui/kit";
import { theme } from "../ui/theme";

// Collected words. They grow day by day; practice happens in the spaced review and the weekly check.
export default function Words() {
  const { course, progress, t, l } = useApp();
  const words = learnedWords(course, progress);
  return <Screen tabs>
    <View><T v="title">{t("words.title")}</T>{words.length > 0 && <T v="small">{t("words.count", { n: words.length })}</T>}</View>
    {!words.length && <Card><T>{t("words.empty")}</T></Card>}
    {course.weeks.map((week) => {
      const mine = words.filter((entry) => entry.day.week === week.id);
      if (!mine.length) return null;
      return <Card key={week.id} style={{ gap: 4 }}>
        <T v="label">{t("home.week", { n: week.id })}</T>
        {mine.map(({ id, word, state }) => {
          const box = state?.box ?? 1;
          return <Row key={id} style={{ paddingVertical: 8, borderTopWidth: 1, borderColor: theme.line }}>
            <T accessible={false} style={{ fontSize: 28, width: 38 }}>{word.emoji}</T>
            <View style={{ flex: 1 }}>
              <T es v="h2">{word.es}</T>
              <T v="small">{l(word.meaning)} · {t(box >= 4 ? "words.strong" : box >= 2 ? "words.growing" : "words.new")}</T>
              <T es v="small">{word.example}</T>
            </View>
            <Speaker text={word.es} size={44} compact />
          </Row>;
        })}
      </Card>;
    })}
  </Screen>;
}
