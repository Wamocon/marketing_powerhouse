import LegalPageShell from '@/components/LegalPageShell';

export const metadata = {
    title: 'Impressum | Momentum Marketing OS',
};

export default function ImpressumPage() {
    return (
        <LegalPageShell
            title="Impressum"
            subtitle="Anbieterkennzeichnung fuer Momentum Marketing OS nach Paragraph 5 TMG und Paragraph 18 MStV."
        >
            <section>
                <h2>Anbieter</h2>
                <p>
                    WAMOCON Academy GmbH<br />
                    Momentum Marketing OS
                </p>
            </section>

            <section>
                <h2>Vertretungsberechtigt</h2>
                <p>Geschaeftsfuehrung der WAMOCON Academy GmbH.</p>
            </section>

            <section>
                <h2>Kontakt</h2>
                <p>
                    E-Mail: kontakt@wamocon.de<br />
                    Telefon: Bitte im Projektprofil hinterlegte Kontaktwege verwenden.
                </p>
            </section>

            <section>
                <h2>Registerangaben</h2>
                <p>
                    Handelsregister, Registernummer, Sitz sowie USt-IdNr. werden in der produktiven Fassung
                    gemaess den offiziellen Projektdaten gefuehrt.
                </p>
            </section>

            <section>
                <h2>Inhaltlich Verantwortlich</h2>
                <p>WAMOCON Academy GmbH, verantwortlich fuer eigene Inhalte gemaess Paragraph 18 Abs. 2 MStV.</p>
            </section>

            <section>
                <h2>Haftungshinweis</h2>
                <p>
                    Trotz sorgfaeltiger inhaltlicher Kontrolle uebernehmen wir keine Haftung fuer die Inhalte externer
                    Links. Fuer den Inhalt verlinkter Seiten sind ausschliesslich deren Betreiber verantwortlich.
                </p>
            </section>
        </LegalPageShell>
    );
}
