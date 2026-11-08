import { LegalDocument, LegalSections } from "../../components/legal-document";
import { usageSections } from "../../lib/legal";
export default function Usage() {
  return (
    <LegalDocument title="Hinweise zur Nutzung">
      <LegalSections sections={usageSections} />
    </LegalDocument>
  );
}
