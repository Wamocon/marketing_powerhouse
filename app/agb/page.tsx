import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
    title: 'AGB | Momentum Marketing OS',
};

export default function AgbPage() {
    return (
        <LegalPageShell
            title="Allgemeine Geschaeftsbedingungen (AGB)"
            subtitle="Nutzungsbedingungen fuer Momentum Marketing OS der WAMOCON Academy GmbH."
        >
            <section>
                <h2>1. Geltungsbereich</h2>
                <p>
                    Diese AGB regeln die Nutzung der Plattform Momentum Marketing OS zwischen der WAMOCON Academy
                    GmbH und den registrierten Nutzerinnen und Nutzern bzw. deren Organisationen.
                </p>
            </section>

            <section>
                <h2>2. Leistungsgegenstand</h2>
                <p>
                    Momentum Marketing OS bietet Funktionen zur Planung, Steuerung und Dokumentation von
                    Marketingaktivitaeten. Der konkrete Funktionsumfang richtet sich nach der jeweils gebuchten bzw.
                    bereitgestellten Version.
                </p>
            </section>

            <section>
                <h2>3. Registrierung und Zugang</h2>
                <p>
                    Die Nutzung setzt eine Registrierung voraus. Zugangsdaten sind vertraulich zu behandeln und vor
                    unbefugtem Zugriff zu schuetzen. Nutzer sind fuer Aktivitaeten unter ihrem Zugang verantwortlich.
                </p>
            </section>

            <section>
                <h2>4. Pflichten der Nutzer</h2>
                <p>
                    Nutzer stellen sicher, dass eingestellte Inhalte keine Rechte Dritter verletzen und keine
                    rechtswidrigen Inhalte verarbeitet werden. Es gelten zudem die internen Compliance-Regeln der
                    jeweiligen Organisation.
                </p>
            </section>

            <section>
                <h2>5. Verfuegbarkeit und Aenderungen</h2>
                <p>
                    Die Plattform wird mit wirtschaftlich vertretbarem Aufwand verfuegbar gehalten. Wartungen,
                    Weiterentwicklungen und technische Aenderungen bleiben vorbehalten, soweit sie zumutbar sind.
                </p>
            </section>

            <section>
                <h2>6. Haftung</h2>
                <p>
                    Es gelten die gesetzlichen Haftungsregeln. Fuer leichte Fahrlaessigkeit haften wir nur bei
                    Verletzung wesentlicher Vertragspflichten und beschraenkt auf den typischerweise vorhersehbaren
                    Schaden.
                </p>
            </section>

            <section>
                <h2>7. Schlussbestimmungen</h2>
                <p>
                    Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit
                    der uebrigen Bestimmungen unberuehrt.
                </p>
            </section>

            <section>
                <h2>8. Stand</h2>
                <p>Diese AGB wurden zuletzt aktualisiert: 22.03.2026.</p>
            </section>
        </LegalPageShell>
    );
}
