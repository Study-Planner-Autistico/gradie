# DESIGN.md — Regole di design (v1)

> Fonti di ispirazione (solo stile, nessun asset copiato): card wallet con gradiente, app di task "Today", app finanza con tab bar flottante, card profilo con gradiente verde, schermata impostazioni a liste raggruppate. Più **Liquid Glass di Apple (iOS 26)**.
> Sostituisce la v0, ispirata a un'app con card blu piene. La nuova direzione è più vicina alla dec. 50 (minimal, Notion/Linear).
> Token in codice: `src/theme/tokens.ts`. Ogni valore passa dai token: niente colori o spaziature scritti a mano nei componenti.

## 0. TL;DR (leggi questo per primo)
- **Base neutra:** sfondo grigio chiaro `#F2F2F4`, card bianche molto arrotondate (28), poche ombre.
- **Inchiostro:** testo e bottone primario quasi neri (`#16161A`). Il bottone primario è una **pill nera** a tutta larghezza.
- **Un accento:** pervinca `#6E6BF0`, usato per selezione, checkbox, link e la voce attiva.
- **Tinte per tipo:** ogni tipo di elemento in Agenda ha un fondo tenue e un testo saturo (lezione lilla, appuntamento rosa, attività ambra, evento ufficiale verde, festività grigio).
- **Una card in evidenza per schermata** con gradiente "mesh" azzurro-lilla. Tutto il resto è bianco.
- **Liquid Glass** per ciò che *galleggia* sopra i contenuti: tab bar, bottoni rotondi nell'header, bottoni flottanti, chip sopra il gradiente, sheet. **Mai** per le card di contenuto.
- **Orari in cifre a larghezza fissa** (tabular), come in un'app di calendario.
- Icone **outline monocromatiche** (Ionicons nel codice, SF Symbols nella tab bar nativa).

## 1. Liquid Glass (dove e come)

| Elemento | Glass? | Implementazione |
|---|---|---|
| Tab bar | ✅ | iOS e Android: `NativeTabs` di Expo Router (su iOS 26 è Liquid Glass di sistema, si riduce durante lo scroll). Web: tab bar flottante JS con blur |
| Bottoni rotondi nell'header (ambiente, notifiche, impostazioni, +) | ✅ | `<GlassButton>`: `GlassView` interattivo |
| Chip sopra la card a gradiente | ✅ | `<Glass>` con stile `clear` |
| Sheet (selettore ambienti, menu) | ✅ | `presentation: 'formSheet'`: iOS 26 applica il glass da solo |
| Card di contenuto, liste, moduli | ❌ | Superfici bianche (`surface`): il glass sopra il glass non si legge |
| Testo lungo | ❌ | Mai su glass |

**Fallback (componente `src/components/Glass.tsx`):**
- iOS 26+ → `GlassView` di `expo-glass-effect`, verificato con `isLiquidGlassAvailable()`.
- iOS precedenti, Android e web → `BlurView` di `expo-blur` + velo `glassFallback` + bordo 1 px `glassBorder`.
- Expo Go: il glass nativo dipende dalla versione di iOS del telefono.

**Regole:**
- Il glass sta sempre sopra contenuti colorati o che scorrono: è lì che si vede.
- Forme del glass: cerchio (bottoni da 44) o pill. Niente rettangoli con angoli piccoli.
- Le icone sul glass usano `text`, mai colori di marca. L'accento solo se l'elemento è selezionato.
- "Riduci trasparenza" del sistema → il fallback a colore pieno è gestito dal sistema e da `expo-blur`.

## 2. Colori

### 2.1 Base
| Token | Light | Dark | Uso |
|---|---|---|---|
| `bg` | `#F2F2F4` | `#0C0C0F` | sfondo schermo |
| `surface` | `#FFFFFF` | `#17171C` | card, liste |
| `surfaceMuted` | `#F6F6F8` | `#1F1F26` | righe interne, celle giorno, input |
| `border` | `#E6E6EA` | `#2A2A33` | separatori, bordo dei bottoni secondari |
| `text` | `#16161A` | `#F4F4F6` | testo principale |
| `textSecondary` | `#8B8B96` | `#9A9AA6` | metadati, sottotitoli |
| `textTertiary` | `#B9B9C2` | `#5F5F6B` | placeholder, testo barrato |
| `ink` / `onInk` | `#16161A` / bianco | invertiti | bottone primario |
| `accent` | `#6E6BF0` | `#8C89FF` | selezione, checkbox, link |
| `success` / `successBg` | `#24894F` / `#E2F5E9` | — | chip positive (es. media) |
| `danger` | `#D93D52` | `#FF9AA8` | errori, scadenze superate |

### 2.2 Regole
- Contrasto minimo 4.5:1 per il testo. Le tinte §2.3 sono già scelte per rispettarlo (testo saturo su fondo tenue).
- Un solo accento per schermata. Il verde solo per i dati positivi, il rosso solo per errori e ritardi.
- Nessuna personalizzazione dei colori da parte dell'utente (dec. 49).

### 2.3 Tinte per tipo di elemento (`tints`)
| Tipo | Fondo / testo (light) | Dove |
|---|---|---|
| `lesson` | `#E9E8FF` / `#5451D6` | lezioni (orario) |
| `appointment` | `#FFE9EC` / `#D93D52` | appuntamenti personali |
| `activity` | `#FFF1D9` / `#B86E00` | compiti, verifiche, esami (dal modulo Attività) |
| `official` | `#E2F5E9` / `#24894F` | eventi ufficiali di classe |
| `holiday` | `#EEEEF1` / `#6B6B76` | festività, vacanze, chiusure |
Il colore indica il **tipo**, non la materia (i colori per materia restano una decisione aperta).

### 2.4 Gradiente "mesh"
- Light: `#C7D3FF → #E4D8FF → #F4F5FB` (diagonale), più un velo azzurro in basso a destra. Dark: indaco scuro.
- Al massimo **una card a gradiente per schermata** (es. il riepilogo di oggi in Home, il profilo).
- Testo sul gradiente: `text`. Chip sopra il gradiente: glass `clear`.

## 3. Tipografia
Font di sistema (SF Pro / Roboto).

| Token | Size/Line | Peso | Uso |
|---|---|---|---|
| `hero` | 44/48 | 700, tracking −1 | numero grande nella card a gradiente (giorno, media) |
| `display` | 30/36 | 700 | titoli dell'onboarding |
| `title1` | 26/32 | 700 | titolo della schermata ("Agenda", "Profilo") |
| `title2` | 20/26 | 600 | titolo della card |
| `headline` | 17/22 | 600 | titoli delle righe, nomi |
| `body` | 15/20 | 400 | testo |
| `callout` | 14/19 | 500 | bottoni secondari, link |
| `caption` | 12/16 | 500 | metadati, etichette |
| `time` | 13/17 | 500, cifre tabular | orari ("09:30 – 10:00") |

- Il titolo della schermata è allineato a sinistra, a 16 dal bordo.
- Testi sempre in `src/i18n` (italiano e inglese).

## 4. Spaziatura, raggi, ombre
- Spaziatura: `4 · 8 · 12 · 16 · 20 · 24 · 32`. Margine laterale 16, spazio tra card 12, padding delle card 20.
- Raggi: `sm 10` (celle, chip piccole) · `md 16` (righe evento, input) · `lg 22` (card interne) · `xl 28` (card) · `pill`.
- Annidamento: raggio interno = raggio esterno − padding (es. una card da 28 con padding 12 contiene righe da 16).
- Ombre: solo `0 2 12 shadow` sulle card. Il glass non ha ombre aggiunte.

## 5. Componenti

### 5.1 Header della schermata (`ScreenHeader`)
- A sinistra: titolo `title1`, oppure l'avatar da 44 che apre il **selettore ambienti** (in Home).
- A destra: fino a 2 `GlassButton` rotondi da 44 (es. notifiche, impostazioni, +).
- Sotto, facoltativo: un sottotitolo `callout` secondario (es. il nome dell'ambiente attivo).

### 5.2 Card a gradiente (`GradientCard`)
- Raggio 28, padding 20, gradiente §2.4.
- Contenuto tipico: etichetta in `caption`, valore `hero`, riga di chip glass in basso.

### 5.3 Riga evento (`EventRow`) — ispirata all'app "Today"
- Fondo della tinta del tipo, raggio 16, padding 12×14.
- Riga 1: titolo `headline` (colore `text`). Riga 2: orario `time` con il colore della tinta.
- A destra: un elemento facoltativo (chip con l'aula, data di scadenza, icona del tipo).
- Le lezioni del docente mostrano un lucchetto piccolo: non sono modificabili (dec. 102).

### 5.4 Riga lista (`ListRow`) — ispirata alla schermata impostazioni
- Altezza minima 56, icona outline da 20 a sinistra, etichetta `body`, e a destra un bottone rotondo da 32 (`surfaceMuted`) con la freccia →.
- Righe raggruppate in una card bianca, separatore da 1 px rientrato a 48.

### 5.5 Bottoni
- **Primario:** pill nera (`ink`) alta 56, testo `headline` `onInk`. Facoltativo: un cerchio bianco con la freccia a sinistra, come in "Get in Touch".
- **Secondario:** pill `surfaceMuted` con testo `text`, oppure con bordo `border`.
- **Glass:** `GlassButton` rotondo da 44 con icona da 20.
- Premuto: scala 0.97 e opacità 0.85 (il glass interattivo ha il suo feedback nativo).

### 5.6 Chip
- Pill alta 28, padding 10, testo `caption`. Varianti: tinta (§2.3), `successBg` (dati positivi), glass (sopra il gradiente).

### 5.7 Striscia della settimana (`WeekStrip`)
- 7 colonne: in alto l'etichetta del giorno (`caption`), sotto una cella da 40 con raggio 12.
- Selezionato: fondo `ink`, numero `onInk`. Oggi (se non selezionato): numero `accent`. Gli altri: `surfaceMuted`.
- Un puntino da 4 sotto il numero se ci sono elementi in quel giorno.

### 5.8 Avatar
- Foto, oppure le iniziali di nome e cognome (dec. 16) su `surfaceMuted`. Cerchio.

## 6. Pagine (stato attuale del prototipo)
- **Home:** header (avatar → ambienti, notifiche, impostazioni) → card a gradiente "Oggi" (giorno, riepilogo, chip glass) → card "Oggi" con le righe evento → "Prossime scadenze" → "Andamento" (media, **senza previsioni**: briefing dec. 26) → "Ultime attività" → "Community". Ordine fisso (dec. 20, 21).
- **Agenda:** titolo + `GlassButton` "+" → mese e settimana → striscia della settimana → elenco del giorno con le righe evento → link "Calendario dell'anno". Le viste giorno/settimana/mese sono rinviate (dec. 95).
- **Profilo:** card a gradiente con avatar, nome, email e ambiente attivo → gruppi di righe: Account, Ambienti, Sicurezza, Preferenze, Privacy e dati (modulo 01 §5).
- **Selettore ambienti:** sheet con la lista degli istituti, una spunta su quello attivo e "Nuovo ambiente".

## 7. Stati
- **Vuoto:** icona outline in un cerchio `surfaceMuted`, testo `body` secondario, al massimo una CTA.
- **Caricamento:** skeleton con la stessa forma del contenuto.
- **Errore:** riga con bordo `danger` e il link "Riprova".
- **Offline** (dec. 54): chip glass "Offline · sola lettura" sotto l'header.

## 8. Movimento
- 150 ms per il press, 250 ms per le transizioni, curve standard iOS. Rispettare "Riduci movimento".
- Su iOS 26 la tab bar nativa si riduce scorrendo verso il basso (`minimizeBehavior="onScrollDown"`).

## 9. Accessibilità (standard del sistema, dec. 47)
- Aree tappabili ≥ 44×44 (i bottoni da 32 nelle righe hanno l'intera riga tappabile).
- Dynamic Type: le altezze sono minime, mai fisse sul testo.
- `accessibilityLabel` su ogni bottone glass. Lo stato selezionato viene annunciato.
- Il significato non passa mai solo dal colore: tipo = tinta + icona o etichetta.

## 10. Divieti
- Niente gamification: punti, badge premio, streak, classifiche (dec. 57).
- Niente widget riordinabili in Home (dec. 21). Niente temi utente (dec. 49).
- Niente asset copiati dalle immagini di ispirazione (Memoji, illustrazioni, loghi, testi).
- Niente emoji come icone. Niente glass sopra il glass. Niente glass dietro testo lungo.
- Niente presenze sulle lezioni (dec. 97).

## 11. Decisioni di design aperte
1. Colori per materia: sì o no?
2. Illustrazioni: stile proprio o solo icone?
3. Logo e nome definitivi ("Orbita" è provvisorio).
4. Layout per iPad (priorità alta per gli appunti, dec. 28).
5. A che ora arriva il promemoria "il giorno prima" (dec. 107).
