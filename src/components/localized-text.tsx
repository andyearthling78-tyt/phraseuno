import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import { useI18n } from "../lib/i18n";
// Source-string catalogue preserves existing stored feedback while allowing a live language switch.
export function Text({
  children,
  translate = true,
  ...props
}: TextProps & { translate?: boolean }) {
  const { t, language } = useI18n();
  const localize = (child: React.ReactNode): React.ReactNode =>
    Array.isArray(child)
      ? child.map(localize)
      : typeof child === "string" && translate
        ? t(child)
        : child;
  return (
    <NativeText
      {...props}
      accessibilityLanguage={
        props.accessibilityLanguage ?? (language === "en" ? "en" : "de")
      }
    >
      {localize(children)}
    </NativeText>
  );
}
