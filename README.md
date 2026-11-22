# Gradie

<img src="assets/brand/gradie-logo.png" width="96" alt="Icona di Gradie: una nuvoletta con il tocco da laureato" />

Ecosistema all-in-one per studenti delle superiori e dell'università italiane: lezioni, scadenze, attività, materiali, voti, collaborazione e AI in un unico posto.

> Stato: **scheletro iniziale**. Navigazione e design system di base; i moduli sono in progettazione uno alla volta (vedi `docs/briefing.md`).

## Stack
- React Native + **Expo SDK 58** (Expo Go per la prototipazione)
- **Expo Router** (`src/app/`)
- TypeScript
- Backend: **non ancora scelto** (decisione rinviata)

## Avvio
```bash
npm install
npx expo start        # poi apri con Expo Go su iPhone (scansiona il QR)
```
Comandi utili: `npx tsc --noEmit` (typecheck), `npx expo-doctor`.

## Documenti
- [`docs/briefing.md`](docs/briefing.md) — briefing di prodotto e decisioni vincolanti (1–61)
- [`DESIGN.md`](DESIGN.md) — regole di design e token
- [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — istruzioni per agenti AI

## Collaborare
1. Crea un branch da `main` (`feat/...`, `fix/...`, `docs/...`).
2. Apri una Pull Request e chiedi una review.
3. Le modifiche UI devono rispettare `DESIGN.md`; le decisioni di prodotto il briefing.
