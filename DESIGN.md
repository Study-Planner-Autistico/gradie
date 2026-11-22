# DESIGN.md — regole di design (v3, Gradie)

> Brand: **Gradie** (dec. 114). Icona e mascotte: la nuvoletta con il tocco (`assets/brand/gradie-logo.png`, `src/components/Mascot.tsx`).
> Base: **Atlassian Design System** (atlassian.design). Valori presi da `@atlaskit/tokens` 20.14 (temi `atlassian-light` / `atlassian-dark`).
> Regola dei colori: **il brand è il viola del logo**; neutri, semantici e tinte per tipo restano Atlassian.
> Disposizione delle pagine: le immagini di ispirazione inviate dall'utente (card bianche su sfondo grigio, profilo con avatar grande).
> Onboarding: struttura ispirata all'onboarding di Waterllama (iOS), senza copiarne asset, mascotte o gamification.
> Fonte di verità del codice: `src/theme/tokens.ts`. Nessun valore hardcoded nei componenti.

## 0. TL;DR (leggi questo per primo)
- Tipografia, raggi, spaziatura, elevazione, movimento, neutri e semantici sono Atlassian. **Brand Gradie `#5D55D7`** (viola del logo), testo `#292A2E`.
- La mascotte compare nei momenti chiave: benvenuto, accesso, blocco età, fine onboarding, moduli in arrivo.
- Sfondo `surface.sunken` grigio chiaro, contenuti su card `surface.raised` bianche (raggio 12) con `shadow.raised`.
- Bottoni Atlassian a raggio 8, alti 48 su mobile. **Un solo primary per area.**
- Lozenge (chip) a raggio 4, testo 12 bold. Colore = tipo, mai solo colore.
- Liquid Glass solo dove lo dà iOS: tab bar nativa e form sheet. Niente glass disegnato a mano.
- Light e dark seguono il sistema. Font di sistema (fallback ufficiale del token Atlassian).

## 1. Principi
1. **Chiaro prima di tutto:** una cosa per schermata, titoli brevi, testo `text.subtle` per le spiegazioni.
2. **Fluido:** ogni passo entra con un movimento breve (250–400 ms, `easing.out.expo`), con feedback aptico leggero.
3. **Onesto:** niente premi, streak o badge (dec. 57). Le cose non ancora disponibili lo dicono ("In arrivo").
4. **Accessibile:** contrasto ≥ 4.5:1, aree tappabili ≥ 44, etichette su tutto (dec. 47).

## 2. Colori (`colors.*` → token Atlassian)

### 2.1 Base
| Token app | Token Atlassian | Light | Dark |
|---|---|---|---|
| `bg` | elevation.surface.sunken | `#F8F8F8` | `#18191A` |
| `surface` | elevation.surface.raised | `#FFFFFF` | `#242528` |
| `surfaceOverlay` | elevation.surface.overlay | `#FFFFFF` | `#2B2C2F` |
| `surfaceMuted` | color.background.neutral | `#0515240F` | `#CECED912` |
| `border` | color.border | `#0B120E24` | `#E3E4F21F` |
| `borderInput` | color.border.input | `#8C8F97` | `#7E8188` |
| `text` | color.text | `#292A2E` | `#CECFD2` |
| `textSecondary` | color.text.subtle | `#505258` | `#A9ABAF` |
| `textTertiary` | color.text.subtlest | `#6B6E76` | `#96999E` |
| `accent` | **brand Gradie** | `#5D55D7` | `#9B93FF` |
| `link` | brand Gradie | `#5149C9` | `#A9A2FF` |
| `selected` / `selectedText` | brand tenue | `#EEECFF` / `#4A42C2` | `#29254F` / `#B3ACFF` |
| `borderFocused` | brand | `#7A70F0` | `#9B93FF` |
| `gold` | oro della nappa | `#F7C55A` | `#F7C55A` |
| `ink` | color.background.neutral.bold | `#292A2E` | `#CECFD2` |
| `blanket` | color.blanket | `#050C1F75` | `#10121499` |

### 2.2 Semantici (testo / sfondo)
success `#4C6B1F`/`#EFFFD6` · warning `#9E4C00`/`#FFF5DB` · danger `#AE2E24`/`#FFECEB` · information `#1558BC`/`#E9F2FE` · discovery `#803FA5`/`#F8EEFE`. Dark in `tokens.ts`.
- Verde solo per dati positivi, rosso solo per errori e ritardi, viola (discovery) per le novità.

### 2.3 Tinte per tipo (`tints`: accent.*.subtlest + text.accent.*)
| Tipo | Accent | Fondo / testo light |
|---|---|---|
| `lesson` | blue | `#E9F2FE` / `#1558BC` |
| `appointment` | magenta | `#FFECF8` / `#943D73` |
| `activity` | orange | `#FFF5DB` / `#9E4C00` |
| `official` | green | `#DCFFF1` / `#216E4E` |
| `holiday` | gray | `#F0F1F2` / `#505258` |
Il colore indica il **tipo**, non la materia (colori per materia: decisione aperta).

### 2.4 Gradienti
- **`heroGradient`** (tenue, lavanda → pervinca → bianco): al massimo **una card per schermata** (riepilogo di oggi in Home). Testo `text`.
- **`brandGradient`** (pieno, viola → blu del logo, scurito per il testo bianco ≥ 5:1): solo nei **momenti di brand** a tutto schermo (benvenuto). Sopra: testo bianco, bottone `inverse` (bianco con testo viola) e `inverseSubtle`.
- `gold` solo per stella, nappa e piccoli accenti decorativi: mai come testo o sfondo di testo.

## 3. Tipografia (font.heading.* / font.body.*)
Font: di sistema (SF Pro / Roboto). Atlassian Sans non è incluso: il suo stack ufficiale ripiega su `-apple-system`.

| Token app | Token Atlassian | Size/Line | Peso |
|---|---|---|---|
| `hero` | — (estensione mobile) | 40/44 | bold |
| `display` | heading.xxlarge | 32/36 | bold |
| `title1` | heading.xlarge | 28/32 | bold — titolo schermata |
| `title2` | heading.medium | 20/24 | bold — titolo card |
| `headline` | heading.small | 16/20 | bold — righe, bottoni |
| `body` | body.large | 16/24 | regular — testo su mobile |
| `callout` | body (medium) | 14/20 | 500 — link, etichette |
| `caption` | body.small | 12/16 | regular — metadati |
| `overline` | heading.xxsmall | 12/16 | bold — etichette dei campi e delle sezioni |
| `metric` | metric.large | 28/32 | bold, cifre tabular — codici, numeri |
| `time` | — | 14/20 | 500, cifre tabular — orari |
- Bold Atlassian = 653 → `'700'` su iOS. Sentence case ovunque (niente MAIUSCOLO).

## 4. Spaziatura, raggi, elevazione
- **Spaziatura** (space.*): `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`. Margine laterale 16 (schermate) o 24 (onboarding), padding card 16.
- **Raggi** (radius.*): small 4 (lozenge, checkbox) · medium 6 (input, codice) · large 8 (bottoni, righe, opzioni) · xlarge 12 (card) · xxlarge 16 (sheet, illustrazioni) · full (avatar, FAB, pill).
- **Elevazione:** `shadowRaised` sulle card, `shadowOverlay` su sheet, FAB e satelliti dell'illustrazione. In dark le superfici più alte sono più chiare.

## 5. Componenti (`src/components/`)
### 5.1 `ScreenHeader`
Titolo `title1` a sinistra (o avatar + saluto `headline` in Home), a destra fino a 2 `IconButton`.
### 5.2 `Card` / `GradientCard`
Raggio 12, padding 16, `shadowRaised`.
### 5.3 `EventRow`
Fondo della tinta, **barra sinistra di 3 px** col colore del tipo, raggio 8. Titolo `headline`, orario `time` colorato, icona del tipo a destra. Lucchetto per le lezioni del docente (dec. 102).
### 5.4 `ListGroup` / `ListRow`
Card raised; riga alta ≥ 56 con icona in un riquadro 32 (`surfaceMuted`, raggio 8), etichetta `callout`, dettaglio `caption`, **chevron** a destra. Separatore 1 px rientrato a 48.
### 5.5 Bottoni (`Button`, `IconButton`, `Fab`)
| Appearance | Uso | Colori |
|---|---|---|
| `primary` | l'azione principale, una per area | brand bold / bianco |
| `default` | azioni secondarie | neutral / text.subtle |
| `subtle` | azioni terziarie, link-bottone | trasparente |
| `ink` | "Continua con Apple" | neutral.bold |
| `inverse` / `inverseSubtle` | sopra il `brandGradient` | bianco con testo viola / trasparente con testo bianco |
| `danger` / `warning` / `discovery` | conferme distruttive, cambi importanti, novità | semantici |
- Alti 48, raggio 8, testo `headline`, icona 18 prima o dopo. Premuto: colore `.pressed` + scala 0.98. Disabilitato: neutral + `text.disabled`. Caricamento: spinner al posto del testo.
- `IconButton`: cerchio 44, `surface` + `shadowRaised` (default) o trasparente (subtle).
- `Fab`: cerchio 56 brand con `shadowOverlay`, a 20 dal bordo, sopra la tab bar. Uno per schermata.
### 5.6 Lozenge (`Chip`)
Alta 24, raggio 4, testo `overline`, icona 12 facoltativa. Varianti: tinta per tipo, success, information, warning, danger, discovery, muted.
### 5.7 `WeekStrip`
Celle 40 raggio 8; selezionato = brand bold, oggi = numero brand, puntino 4 se ci sono elementi.
### 5.8 `Avatar`
Cerchio con iniziali (dec. 16) su `lesson.bg`, bordo 2 `surface`. Nel profilo: 128 con gradiente.
### 5.9 Profilo social
Pill interesse (44, bordo 1.5, icona in quadratino tinto), righe azione (cerchio 48), "Profilo privato" come lozenge (dec. 15). Niente spunte "verificato".
### 5.10 `TextField`
Etichetta `overline` sopra; campo alto 48, raggio 6, bordo 1 `borderInput`; focus = bordo 2 `borderFocused`; errore = bordo 2 danger + icona e messaggio sotto. Testo di aiuto `caption` subtlest.
### 5.11 `SectionMessage`
Fondo semantico, icona 20 colorata, titolo `headline` facoltativo, testo `callout`. Raggio 8, padding 16.
### 5.12 `ProgressBar`
Alta 6, raggio pieno, traccia neutral, riempimento brand animato (400 ms, out.expo).
### 5.13 `OptionCard` e `ChoiceSheet` (onboarding)
- Opzione: alta ≥ 64, raggio 8, bordo 2 `border` → selezionata `accent` + fondo `selected`, radio a destra.
- Sheet: sale dal basso con una molla, raggio 16 in alto, `shadowOverlay`. Toccare un'opzione la seleziona e **porta avanti da sola dopo ~320 ms**.
### 5.14 `CodeInput`
6 caselle 46×56, raggio 6, cifre `metric`. Casella attiva con bordo focus; errore = bordo danger + scossa orizzontale + aptica di avviso. Autocompletamento del codice SMS/email di iOS attivo.
### 5.15 `OrbitArt` (illustrazione dei passi)
Nucleo tinto con l'icona del passo, due anelli tratteggiati, 4 satelliti bianchi che fluttuano. Per i passi "di servizio" dell'onboarding (metodo, verifica, istituto, importa…).
### 5.16 `Mascot` (nuvoletta col tocco)
- Vettoriale (react-native-svg), colori fissi `mascot.*` presi dal logo, uguale in chiaro e scuro.
- Umori: `happy` (stella), `celebrate` (stella grande, sorriso, rimbalzo più vivace), `sleepy` (occhi chiusi, "z").
- Fluttua e sbatte le palpebre ogni 3–5 s; ferma con "Riduci movimento". Con `accessibilityLabel` è un'immagine, altrimenti decorativa.
- **Dove:** benvenuto (`celebrate`, su `brandGradient`), accesso (`happy`), blocco età (`sleepy`), fine onboarding (`celebrate` + coriandoli), schermate dei moduli in progettazione (`sleepy`).
- **Dove no:** dentro le liste, accanto ai voti o ai dati (resta un tocco di carattere, non decorazione ovunque). Mai sostituirla con l'immagine raster del logo.

## 6. Onboarding (modulo 01, `src/app/onboarding.tsx`)
Un'unica route con una macchina a passi: header fisso (indietro + progress bar), i passi scorrono dentro.

| Passo | Schermata | Forma |
|---|---|---|
| Benvenuto | ON-01 | `brandGradient`, nome Gradie, titolo bianco, mascotte `celebrate`, `inverse` "Inizia" + `inverseSubtle` "Ho già un account" |
| Metodo | ON-04 | Apple (ink), Google, Email (default) |
| Data di nascita | ON-02 → ON-03 | 3 campi GG/MM/AAAA con focus automatico, section message; < 14 anni → blocco senza azioni |
| Email e password | ON-05 | campi, requisito password con spunta live, consenso |
| Verifica | ON-06 | codice a 6 cifre, avanza da solo, "Reinvia" con conto alla rovescia |
| Nome | ON-07 | precompilato con Apple/Google |
| Ruolo | ON-08 | **sheet** Studente / Docente |
| TOTP (docenti) | ON-09 | QR + chiave + codice → codici di recupero, copia, conferma |
| Percorso | ON-10 | **sheet** Superiori / Università-AFAM |
| Istituto | ON-11 → ON-11b | ricerca con selezione che avanza da sola; "Non trovo" → blocco + segnalazione |
| Dettagli (studenti) | ON-12 | pill indirizzo/tipo, segmentato anno, sezione o corso |
| Periodo (studenti) | ON-13 | **sheet** suddivisione dell'anno |
| Materie | ON-14 | pill multi-selezione + aggiunta con controllo duplicati |
| Importa | ON-15 | segnaposto "In arrivo" (dec. 83) |
| Proteggi (studenti) | ON-17 | card illustrata, primary "Attiva", "Più tardi" in alto a destra |
| Riepilogo | ON-18 | card con righe e "Modifica" su ognuna, primary "Entra" |
| Fine | — | coriandoli una volta, "Tutto pronto, Nome!" |
| Accesso | ON-19 / ON-20 | email/password, Apple/Google, codice 2FA |
- ON-16 (moduli) è saltato finché la dec. 65 non definisce l'elenco.
- Modifica dal riepilogo → si torna al riepilogo; se cambiano ruolo o percorso si ripercorrono i passi successivi (risposte conservate).

## 7. Stati
- **Vuoto:** icona in un riquadro neutral, testo `callout` subtle, al massimo una CTA.
- **Caricamento:** spinner nel bottone; skeleton con la forma del contenuto.
- **Errore:** campo con bordo danger + messaggio; errori di pagina con `SectionMessage` error e "Riprova".
- **Offline** (dec. 54): lozenge "Offline · sola lettura" sotto l'header.

## 8. Movimento (motion.*)
- Durate Atlassian: 100 · 150 · 200 · 250 · 400 · 600 ms. Easing: `out.practical (0.4,1,0.6,1)` per press, `out.expo (0.16,1,0.3,1)` per entrate.
- Entrata passo: traslazione 32 px dal lato della navigazione + dissolvenza, 400 ms. Elementi interni in sequenza (FadeUp, ritardo 80 ms).
- Aptica: selezione su ogni tocco, successo su codice corretto e conferme, avviso sugli errori.
- "Riduci movimento" attivo → niente coriandoli né fluttuazione dell'illustrazione.

## 9. Icona e splash
- Icona iOS: `assets/icon.png` 1024×1024 a filo (iOS arrotonda da sé). Android: `android-icon-background.png` a tutto campo, primo piano trasparente.
- Splash: logo arrotondato su `#F4F2FF` (chiaro) / `#18191A` (scuro). Favicon dal logo.
- Originale: `assets/brand/gradie-logo.png`.

## 9b. Liquid Glass
| Elemento | Glass? |
|---|---|
| Tab bar | ✅ `NativeTabs`: su iOS 26 è Liquid Glass di sistema e **non si riduce** scorrendo (`minimizeBehavior="never"`, dec. 123) |
| Form sheet (ambienti, menu) | ✅ di sistema |
| Tutto il resto | ❌ superfici Atlassian (`surface`, `shadow`) |
Il web usa una tab bar flottante con blur come fallback (`FloatingTabBar`).

## 10. Divieti
- Niente gamification: punti, badge, streak, sfide, classifiche (dec. 57).
- Niente asset copiati dalle ispirazioni (mascotte, illustrazioni, loghi, testi). Niente logo o marchio Atlassian. L'unica mascotte è quella di Gradie.
- Niente emoji come icone. Niente MAIUSCOLO nei bottoni. Niente più di un primary per area.
- Niente widget riordinabili in Home (dec. 21), niente temi utente (dec. 49), niente presenze (dec. 97).

## 11. Decisioni di design aperte
1. Colori per materia: sì o no?
2. Illustrazioni: tenere `OrbitArt` o commissionare uno stile illustrato proprio?
3. ~~Logo e nome~~ → deciso: Gradie (dec. 114). Serve il logo in alta risoluzione / vettoriale originale per l'icona finale (ora ricavata dall'immagine inviata, ~770 px).
4. Layout per iPad (priorità alta per gli appunti, dec. 28).
5. A che ora arriva il promemoria "il giorno prima" (dec. 107).
6. Profilo social: @handle, istituto/città/link visibili? Chi vede contatori e interessi con profilo privato?
7. Onboarding: requisiti reali della password (ora "almeno 8 caratteri" come segnaposto), testi dei consensi, durata del "Reinvia" (ora 30 s), ordine Apple/Google/Email.
8. Onboarding: suggerimenti di materie per indirizzo (ora elenco dimostrativo) e date del periodo didattico (non ancora chieste).
