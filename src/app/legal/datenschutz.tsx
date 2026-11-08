import { LegalDocument, LegalSections } from "../../components/legal-document";
import { privacySections } from "../../lib/legal";
export default function Privacy() {
  return (
    <LegalDocument title="Datenschutzhinweise">
      <LegalSections sections={privacySections} />
    </LegalDocument>
  );
}
