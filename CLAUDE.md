# CLAUDE.md

Leggi in quest'ordine prima di lavorare:
1. `AGENTS.md` — regole Expo/React Native (SDK 58, Expo Router in `src/app/`).
2. `DESIGN.md` — regole di design (stile "storybook", dec. 223). Ogni UI passa dai token in `src/theme/tokens.ts`.
3. `docs/briefing.md` — briefing di prodotto: le decisioni 1–61 sono **vincolanti**.
4. `docs/decisioni.md` — decisioni successive (62+), vincolanti; prevalgono sul briefing se lo modificano.
5. `docs/moduli/` — specifiche dei moduli già lavorati.

## Regole di progetto
- Il nome è **Gradie** (dec. 114): compare solo in `app.json`, `package.json` e `src/i18n`. Icona e mascotte in `assets/brand/` e `src/components/Mascot.tsx`.
- Non inventare requisiti, ruoli, prezzi, integrazioni o backend: elencali come domande aperte (briefing, regole 2-4).
- Si procede **un modulo alla volta**; il primo è "Fondazioni di dominio e configurazione dell'ambiente".
- Stringhe UI solo in `src/i18n` (IT + EN).
- `src/data/demo.ts` contiene solo dati dimostrativi: nessun backend è stato scelto (dec. 53).
- Voti visibili solo allo studente (dec. 36-37). Niente gamification (dec. 57).
- Prima di dichiarare finito: `npx tsc --noEmit`.

## Struttura
```
src/app/            route Expo Router (onboarding, (tabs)/home|agenda|attivita|community|profilo, ambienti, menu)
                    (tabs)/_layout.tsx = NativeTabs (iOS/Android), _layout.web.tsx = tab bar flottante
src/components/     ui.tsx (Button, TextField, Chip…), onboarding.tsx (passi animati), list.tsx, agenda.tsx,
                    haptics.ts, Glass.tsx (solo tab bar web), tabs.ts, FloatingTabBar
src/state/          stato locale (ambiente attivo)
src/theme/          token di design + useTheme()
src/i18n/           testi IT/EN
docs/               briefing e documenti di prodotto
```
