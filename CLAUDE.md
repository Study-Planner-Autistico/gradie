# CLAUDE.md

Leggi in quest'ordine prima di lavorare:
1. `AGENTS.md` — regole Expo/React Native (SDK 58, Expo Router in `src/app/`).
2. `DESIGN.md` — regole di design. Ogni UI passa dai token in `src/theme/tokens.ts`.
3. `docs/briefing.md` — briefing di prodotto: le decisioni 1–61 sono **vincolanti**.

## Regole di progetto
- Nome "Orbita" è **provvisorio**: non spargerlo nel codice oltre a `app.json` e `src/i18n`.
- Non inventare requisiti, ruoli, prezzi, integrazioni o backend: elencali come domande aperte (briefing, regole 2-4).
- Si procede **un modulo alla volta**; il primo è "Fondazioni di dominio e configurazione dell'ambiente".
- Stringhe UI solo in `src/i18n` (IT + EN).
- `src/data/demo.ts` contiene solo dati dimostrativi: nessun backend è stato scelto (dec. 53).
- Voti visibili solo allo studente (dec. 36-37). Niente gamification (dec. 57).
- Prima di dichiarare finito: `npx tsc --noEmit`.

## Struttura
```
src/app/            route Expo Router (welcome, (tabs)/home|agenda|attivita|community|profilo, menu)
src/components/     componenti condivisi (ui.tsx, TodayHeader, LessonCard, FloatingTabBar)
src/theme/          token di design + useTheme()
src/i18n/           testi IT/EN
docs/               briefing e documenti di prodotto
```
