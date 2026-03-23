import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
    title: 'Datenschutz | Momentum Marketing OS',
};

export default function DatenschutzPage() {
    return (
        <LegalPageShell
            title="Datenschutzerklaerung"
            subtitle="Informationen zur Verarbeitung personenbezogener Daten in Momentum Marketing OS (DSGVO)."
        >
            <section>
                <h2>1. Verantwortlicher</h2>
                <p>
                    Verantwortlich fuer die Datenverarbeitung ist die WAMOCON Academy GmbH als Betreiberin von
                    Momentum Marketing OS.
                </p>
            </section>

            <section>
                <h2>2. Verarbeitete Daten</h2>
                <p>
                    Je nach Nutzung verarbeiten wir insbesondere Stamm- und Kontaktdaten, Login-Daten,
                    Nutzungsdaten, Projekt- und Kampagnendaten sowie technisch erforderliche Protokolldaten.
                </p>
            </section>

            <section>
                <h2>3. Zwecke und Rechtsgrundlagen</h2>
                <p>
                    Die Verarbeitung erfolgt zur Bereitstellung der Plattform, Nutzerverwaltung, Sicherheit,
                    Fehleranalyse und Kommunikation. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b, c und f
                    DSGVO sowie ggf. Einwilligungen nach Art. 6 Abs. 1 lit. a DSGVO.
                </p>
            </section>

            <section>
                <h2>4. Empfaenger und Auftragsverarbeiter</h2>
                <p>
                    Wir setzen technische Dienstleister fuer Hosting, Datenbankbetrieb und Infrastruktur ein.
                    Verarbeitung erfolgt auf Basis von Auftragsverarbeitungsvertraegen gemaess Art. 28 DSGVO.
                </p>
            </section>

            <section>
                <h2>5. Speicherdauer</h2>
                <p>
                    Personenbezogene Daten werden nur so lange gespeichert, wie es fuer die genannten Zwecke
                    erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
                </p>
            </section>

            <section>
                <h2>6. Betroffenenrechte</h2>
                <p>
                    Betroffene Personen haben das Recht auf Auskunft, Berichtigung, Loeschung, Einschraenkung,
                    Datenuebertragbarkeit sowie Widerspruch. Erteilte Einwilligungen koennen jederzeit mit Wirkung fuer
                    die Zukunft widerrufen werden.
                </p>
            </section>

            <section>
                <h2>7. Sicherheit</h2>
                <p>
                    Wir setzen angemessene technische und organisatorische Massnahmen ein, um Daten vor Verlust,
                    Manipulation und unbefugtem Zugriff zu schuetzen.
                </p>
            </section>

            <section>
                <h2>8. Stand</h2>
                <p>Diese Datenschutzerklaerung wurde zuletzt aktualisiert: 22.03.2026.</p>
            </section>
        </LegalPageShell>
    );
}
