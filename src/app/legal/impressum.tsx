import { Text } from "../../components/localized-text";

import { Card, s } from "../../components/ui";
import { LegalDocument } from "../../components/legal-document";
import { provider, providerComplete } from "../../lib/legal";
export default function Imprint() {
  const fields = [
    ["Anbieter", provider.name],
    ["Ladungsfähige Anschrift", provider.address],
    ["Kontakt-E-Mail", provider.email],
    ["Telefon", provider.phone],
    ["Rechtsform", provider.legalForm],
    ["Vertretungsberechtigte Person", provider.representative],
    ["Register und Registernummer", provider.register],
    ["Umsatzsteuer-Identifikationsnummer", provider.vatId],
  ];
  return (
    <LegalDocument title="Impressum">
      {!providerComplete && (
        <Card>
          <Text style={s.h2}>Anbieterangaben fehlen noch</Text>
          <Text style={s.body}>
            Dieser Prototyp enthält noch kein vollständiges Impressum. Name bzw.
            Firma, ladungsfähige Anschrift und Kontakt müssen vor einer
            Veröffentlichung ergänzt werden. Weitere Angaben hängen vom Anbieter
            ab.
          </Text>
        </Card>
      )}
      <Card>
        <Text style={s.h2}>Angaben nach § 5 DDG</Text>
        {fields
          .filter(([, v], i) => i < 3 || v)
          .map(([label, value]) => (
            <Text selectable key={label} style={s.body}>
              {label}
              {"\n"}
              {value || "Noch nicht hinterlegt"}
            </Text>
          ))}
      </Card>
    </LegalDocument>
  );
}
