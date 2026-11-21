# DESIGN.md — Regole di design (v0, provvisorie)

> Fonte: immagine di riferimento "Tesla Education" (Dribbble, A. Klimenkov) usata **solo come ispirazione** di stile.
> Non copiare testi, logo, illustrazioni 3D o avatar Memoji dell'immagine.
> Token in codice: `src/theme/tokens.ts`. Ogni valore qui sotto DEVE passare dai token: niente colori/spaziature hardcoded nei componenti.

## 0. TL;DR (leggi questo per primo)
- Sfondo grigio-chiarissimo `#F2F3F5`, superfici bianche, card **molto arrotondate** (24 px).
- Un solo colore brand: **blu elettrico `#0A84FF`** (pieno) + **navy `#2B5BB8`** (variante "inattivo/passato").
- Card evento colorate: fondo blu pieno, testo bianco, "pill" bianche per orari/azioni.
- Tipografia di sistema (SF Pro su iOS), titoli **bold/heavy**, testo secondario grigio `#8A8F98`.
- Barra inferiore **flottante**, pill traslucida con blur, voce attiva = quadrato blu arrotondato con icona+label bianche.
- Tanto respiro: padding schermo 16, gap tra card 12, padding interno card 16.
- Accenti caldi (arancio `#FFB020`) solo per un'azione rapida nell'header (es. calendario). Mai più di 1 accento caldo per schermo.

## 1. Tensione con il briefing (da non risolvere da soli)
Il briefing (dec. 50) chiede stile **minimal/professionale, riferimenti Notion e Linear**. L'immagine è più **colorata e "consumer"** (card blu piene, illustrazioni 3D).
Regola provvisoria: usare la **struttura e la forma** dell'immagine (card arrotondate, pill, tab bar flottante, header saluto+settimana) ma con **densità cromatica contenuta**: il blu pieno è riservato agli elementi *Oggi/in evidenza*; il resto resta bianco/grigio. Decisione definitiva → aperta (vedi §12).

## 2. Colori

### Light
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#F2F3F5` | sfondo schermo |
| `surface` | `#FFFFFF` | card neutre, header, sheet |
| `surfaceMuted` | `#F7F8FA` | celle giorno non selezionate, input |
| `border` | `#E3E5E8` | bordi 1 px celle/input |
| `text` | `#1C1F26` | titoli e testo primario |
| `textSecondary` | `#8A8F98` | date, sottotitoli, label |
| `textTertiary` | `#B4B8BF` | placeholder, disabilitato |
| `primary` | `#0A84FF` | brand, card evidenziate, bottoni primari, tab attiva |
| `primaryPressed` | `#0070E0` | stato premuto |
| `primaryDeep` | `#2B5BB8` | card "passato/assente", variante secondaria piena |
| `onPrimary` | `#FFFFFF` | testo/icone su blu |
| `onPrimaryMuted` | `rgba(255,255,255,0.75)` | testo secondario su blu |
| `pill` | `#FFFFFF` | pill su card blu (orario, CTA) |
| `pillText` | `#0A84FF` | testo CTA nelle pill |
| `accentWarm` | `#FFB020` | singola azione rapida header |
| `success` | `#34C759` | spunta "fatto/presente" |
| `danger` | `#FF3B30` | errori, scadenze superate |
| `neutralBadge` | `rgba(0,0,0,0.25)` | badge "x" negativo su card |
| `tabBar` | `rgba(255,255,255,0.72)` + blur | barra inferiore |

### Dark (dec. 48: chiaro/scuro/auto obbligatori)
| Token | Hex |
|---|---|
| `bg` | `#0E1014` |
| `surface` | `#181B21` |
| `surfaceMuted` | `#20242B` |
| `border` | `#2A2E36` |
| `text` | `#F2F3F5` |
| `textSecondary` | `#9AA0AA` |
| `textTertiary` | `#5E636C` |
| `primary` | `#3395FF` |
| `primaryDeep` | `#24457F` |
| `tabBar` | `rgba(24,27,33,0.72)` + blur |
Gli altri token restano uguali. Testo su `primary` sempre bianco.

### Regole colore
- Contrasto minimo 4.5:1 per testo normale (bianco su `#0A84FF` = ~3.6:1 → usare **solo per testo ≥ 17 pt semibold** o bold; per testo piccolo su blu usare `onPrimary` bold 13+ e verificare).
- Nessuna personalizzazione colore da parte dell'utente (dec. 49).
- Colori per materia: **non definiti** (aperto). Non inventare palette per materia.

## 3. Tipografia
Font di sistema (SF Pro iOS / Roboto Android). Niente font custom.

| Token | Size/Line | Peso | Uso |
|---|---|---|---|
| `display` | 30/36 | 800 | titoli onboarding |
| `title1` | 24/30 | 700 | nome nel saluto ("Anna!"), titoli schermata |
| `title2` | 20/26 | 700 | titolo card evento (materia) |
| `headline` | 17/22 | 600 | intestazioni sezione, nomi persona |
| `body` | 15/20 | 400 | testo |
| `callout` | 14/19 | 500 | pill orario, CTA pill |
| `caption` | 12/16 | 500 | label, metadati, stato ("Presente") |
| `micro` | 10/13 | 600 | label tab bar |

- Saluto header: riga 1 `body` secondario ("Buongiorno,"), riga 2 `title1` ("Anna!").
- Data sotto il saluto: `body` `textSecondary`.
- Mai più di 3 livelli tipografici in una card.
- Testi sempre localizzati IT/EN (dec. 46): niente stringhe hardcoded nei componenti → `src/i18n`.

## 4. Spaziatura e griglia
Scala 4 pt: `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32`.
- Margine laterale schermo: `lg` (16).
- Gap verticale tra card: `md` (12).
- Padding interno card: `lg` (16); header card grande: `xl` (20).
- Gap tra righe interne di una card: `sm` (8).
- Spazio sotto l'ultimo contenuto scrollabile: altezza tab bar + 24.

## 5. Raggi, bordi, ombre
| Token | Valore | Uso |
|---|---|---|
| `radius.sm` | 8 | celle giorno, badge numerici |
| `radius.md` | 14 | avatar quadrato, bottoni icona (44×44) |
| `radius.lg` | 24 | card, header card |
| `radius.xl` | 28 | tab bar flottante |
| `radius.pill` | 999 | pill, bottoni primari |
- Card neutre: nessun bordo, ombra leggerissima `0 2 8 rgba(16,24,40,0.06)`.
- Card blu: nessuna ombra (il colore basta).
- Celle giorno: bordo 1 px `border`; selezionata = fondo `primary`, testo bianco, nessun bordo.
- Bottoni icona header: quadrato 44, `radius.md`, fondo `accentWarm`, icona bianca.

## 6. Componenti (anatomia)

### 6.1 Header "Oggi" (card bianca, `radius.lg`)
1. Riga: avatar quadrato 48 (radius.md, bordo 2 px `primary`) · saluto 2 righe · spacer · bottone icona 44 (accentWarm).
2. Data estesa (`body`, secondario), es. "21 novembre 2026".
3. Week strip: 7 colonne, label giorno (`caption`, secondario, "Lun…Dom") sopra cella 36×36 (`radius.sm`).
   - Oggi/selezionato: fondo `primary`, numero bianco bold.
   - Altri: bordo `border`, numero `textSecondary`.
   - Giorno con eventi: puntino 5 px `accentWarm` in alto a destra della cella.

### 6.2 Card evento/lezione (piena, `radius.lg`)
- Fondo `primary` (in corso/futura) o `primaryDeep` (già passata).
- Riga 1: titolo materia `title2` bianco. **Nessuno stato di presenza** (dec. 97).
- Riga 2: pill bianca con icona orologio + orario `callout` (`text` scuro).
- Riga 3: dettaglio `caption` `onPrimaryMuted` (es. compito).
- Riga 4 (opz.): persona — avatar 24 + nome `headline` bianco + sottotitolo `caption`; a destra CTA pill bianca con testo `pillText` + freccia "→".
- Tutta la card è tappabile (feedback: opacity 0.85 / scale 0.98).
- ⚠️ Non mostrare voti in card visibili ad altri: i voti sono solo dello studente (dec. 36-37).

### 6.3 Card neutra / blocco Home
- Fondo `surface`, `radius.lg`, padding 16.
- Titolo sezione `headline` + link "Vedi tutto" `callout` `primary` a destra.
- I blocchi Home sono fissi e nell'ordine: **Oggi · Prossime scadenze · Andamento · Ultime attività · Aggiornamenti Community** (dec. 20-21). Nessun riordino/nascondimento.

### 6.4 Tab bar flottante
- Posizione: assoluta, margine 12 dai lati e dal fondo (sopra safe area), altezza 68, `radius.xl`, fondo `tabBar` + blur (`expo-blur` quando aggiunto; fallback colore pieno 95%).
- 5 voci fisse (dec. 19): **Home · Agenda · Attività · Community · Profilo**.
- Voce attiva: contenitore 64×56 `radius.lg` fondo `primary`, icona 22 + label `micro` bianche.
- Voce inattiva: icona + label `primary` (o `textSecondary` in dark), nessun fondo.
- Icone: Ionicons (`@expo/vector-icons`) — set unico, stile filled per attiva, outline per inattiva.

### 6.5 Bottone primario
- Pill, altezza 52, larghezza piena (margine 16), fondo `primary`, testo `headline` bianco.
- Premuto: `primaryPressed`. Disabilitato: opacità 0.4.
- Secondario: fondo `surfaceMuted`, testo `primary`.

### 6.6 Sidebar / menu secondario (dec. 18-19)
- Aperto da bottone icona (menu) nell'header. Su telefono: sheet/modale a pieno schermo; su tablet: pannello laterale.
- Lista righe 52 alte: icona in quadrato 32 (`surfaceMuted`, radius.sm) + label `body` + chevron.
- Voci note: Materiali, Appunti, Registro voti, Messaggi, Classi e gruppi, Notifiche, Impostazioni. Moduli non ancora progettati → stato "In progettazione".

### 6.7 Avatar
- Foto profilo utente reale; fallback = iniziali (nome+cognome, dec. 16) su `primary` 15% opacità, testo `primary` bold.
- Quadrato arrotondato (radius.md) per l'utente nell'header; cerchio per persone in liste/card.
- Niente Memoji/illustrazioni 3D come avatar.

## 7. Onboarding / Welcome
- Sfondo gradiente molto tenue (bianco → `#EEF4FF` → `#FFF4EC`).
- Hero centrale: logo dentro cerchio bianco + orbite concentriche sottili (1 px, `border`) con icone materia (stile proprio, NON le illustrazioni dell'immagine). Il nome "Orbita" nasce da qui.
- Nome app `headline` secondario, claim `display` centrato max 2 righe.
- CTA primaria in basso ("Inizia"), margine 16, sopra safe area.

## 8. Stati (sempre progettati)
- **Vuoto**: icona 40 in cerchio `surfaceMuted`, titolo `headline`, testo `body` secondario, 1 CTA opzionale. Tono incoraggiante, nessuna colpa.
- **Caricamento**: skeleton con la stessa forma della card (`surfaceMuted`, shimmer leggero). Niente spinner a schermo intero salvo primo avvio.
- **Errore**: card neutra con bordo `danger` 1 px, messaggio + "Riprova".
- **Offline** (dec. 54): banner sottile in alto `surfaceMuted` "Sei offline — contenuti in sola lettura".
- **Privato**: icona lucchetto + "Visibile solo a te" (`caption`) dove serve chiarezza (voti, appunti).

## 9. Movimento
- Durate: 150 ms (press), 250 ms (transizioni), easing standard iOS.
- Press: scale 0.98 + opacity 0.85.
- Cambio giorno nella week strip: cross-fade lista 200 ms.
- Rispettare "Riduci movimento" del sistema (dec. 47).

## 10. Accessibilità (standard OS, dec. 47)
- Target minimi 44×44.
- Supporto Dynamic Type (non fissare altezze dei testi; le card crescono).
- `accessibilityLabel` su ogni bottone icona; stato selezionato annunciato su tab e giorni.
- Non affidare significato al solo colore (stato lezione = colore + testo + icona).

## 11. Divieti
- Niente gamification visiva: punti, badge-premio, streak, classifiche, coriandoli (dec. 57).
- Niente widget personalizzabili / drag&drop in Home (dec. 21).
- Niente temi colore utente (dec. 49).
- Niente asset dell'immagine di riferimento (Memoji, 3D, logo, testi).
- Niente emoji come icone di UI.

## 12. Decisioni di design aperte
1. Quanto blu pieno? (immagine "colorata" vs Notion/Linear "minimal").
2. Colori per materia: sì/no, palette?
3. Illustrazioni: stile proprio da commissionare o solo icone?
4. Logo e nome definitivi (Orbita è provvisorio).
5. Layout tablet/iPad (priorità alta per appunti, dec. 28): sidebar fissa?
