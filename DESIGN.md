# DESIGN.md — regole di design (v4, Gradie)

> Brand: **Gradie** (dec. 114). Icona e mascotte: la nuvoletta con il tocco (icona: `assets/brand/gradie-logo.png`; mascotte e GIF: `assets/mascot/`, `src/components/Mascot.tsx`, dec. 201).
> Base: **stile "storybook"** (dec. 223), ispirato all'app Duolingo senza copiarne asset, font o mascotte: carta bianca, superfici piatte con bordi pieni 2 px, pulsanti e card tridimensionali, titoli tondi. Struttura dei componenti e movimento restano quelli nati su Atlassian.
> Regola dei colori: **il brand è il viola del logo** (titoli, bottoni, selezione); blu per link e azioni secondarie; grigi caldi per il testo.
> Disposizione delle pagine: le immagini di ispirazione inviate dall'utente (card bianche su sfondo grigio, profilo con avatar grande).
> Onboarding: struttura ispirata all'onboarding di Waterllama (iOS), senza copiarne asset, mascotte o gamification.
> Fonte di verità del codice: `src/theme/tokens.ts`. Nessun valore hardcoded nei componenti.

## 0. TL;DR (leggi questo per primo)
- **Brand Gradie `#5D55D7`** per titoli grandi, bottoni principali e selezione; link `#1A73C9`; testo `#4B4B4B`, secondario `#777777`.
- La mascotte compare nei momenti chiave: benvenuto, accesso, blocco età, fine onboarding, moduli in arrivo.
- Sfondo bianco; card bianche raggio 12 con **bordo 2 px e 4 px sotto** (tridimensionali). Niente ombre sfumate, gradienti o vetro.
- Bottoni raggio 12, alti 48, **tridimensionali** (bordo inferiore scuro di 4 px che sparisce premendo), testo in maiuscolo spaziato. **Un solo primary per area.**
- Liste in un riquadro con bordo 2 px e divisori 2 px a tutta larghezza; titoli di sezione in maiuscolo grigio.
- Lozenge (chip) a raggio 12, testo 13 bold maiuscolo. Colore = tipo, mai solo colore.
- Light e dark seguono le Impostazioni. Titoli in **Fredoka**, testo in **Rubik** (dec. 223).

## 1. Principi
1. **Chiaro prima di tutto:** una cosa per schermata, titoli brevi, testo `text.subtle` per le spiegazioni.
2. **Fluido:** ogni passo entra con un movimento breve (250–400 ms, `easing.out.expo`), con feedback aptico leggero.
3. **Onesto:** niente premi, streak o badge (dec. 57). Le cose non ancora disponibili lo dicono ("In arrivo").
4. **Accessibile:** contrasto ≥ 4.5:1, aree tappabili ≥ 44, etichette su tutto (dec. 47).

## 2. Colori (`colors.*`, `src/theme/tokens.ts`)

### 2.1 Base
| Token app | Ruolo | Light | Dark |
|---|---|---|---|
| `bg` / `surface` | carta | `#FFFFFF` | `#131F24` |
| `surfaceOverlay` | sheet, menu | `#FFFFFF` | `#202F36` |
| `surfaceMuted` | campi, fondi tenui | `#F7F7F7` | `#202F36` |
| `border` | bordi e divisori 2 px | `#E5E5E5` | `#37464F` |
| `borderBold` / `borderInput` | contorno dei bottoni secondari | `#AFAFAF` | `#52656D` |
| `text` | testo | `#4B4B4B` | `#F1F7FB` |
| `textSecondary` / `textTertiary` | testo tenue | `#777777` | `#A9B8C0` |
| `accent` | **brand Gradie**: bottoni, progresso | `#5D55D7` | `#5D55D7` |
| `accentPressed` | bordo inferiore dei pulsanti 3D | `#463FB5` | `#3D37A8` |
| `heading` | titoli grandi | `#5D55D7` | `#A9A2FF` |
| `link` | link e azioni secondarie | `#1A73C9` | `#6FB0F5` |
| `selected` / `selectedText` | brand tenue | `#EEECFF` / `#4A42C2` | `#29254F` / `#B3ACFF` |
| `borderFocused` | campo attivo | `#5D55D7` | `#A9A2FF` |
| `gold` | oro della nappa | `#FFC800` | `#FFC800` |
| `blanket` | velo | `#00000066` | `#000000A0` |

### 2.2 Semantici (testo / sfondo)
success `#58A700`/`#D7FFB8` · warning `#CD7900`/`#FFF4D6` · danger `#EA2B2B`/`#FFDFE0` · information `#1899D6`/`#DDF4FF` · discovery `#A560E8`/`#F6E8FF`. Dark in `tokens.ts`.
- Verde solo per dati positivi, rosso solo per errori e ritardi, viola (discovery) per le novità.

### 2.3 Tinte per tipo (`tints`)
| Tipo | Fondo / testo light |
|---|---|
| `lesson` | `#DDF4FF` / `#1270A8` |
| `appointment` | `#FFE3F3` / `#B0307A` |
| `activity` | `#FFF0DB` / `#B35C00` |
| `official` | `#E5FFD1` / `#3F7F00` |
| `holiday` | `#F2F2F2` / `#5E5E5E` |
| `study` | `#F6E8FF` / `#8A3FC2` |
Il colore indica il **tipo**, non la materia. Testo sempre ≥ 4.5:1 sul suo fondo.

### 2.4 Niente gradienti
- `heroGradient` e `brandGradient` sono tinte piatte (il secondo = `accent`): il riquadro "Oggi" della Home e il benvenuto sono viola pieno con testo bianco e bottone `inverse`.
- `gold` solo per stella, nappa e piccoli accenti decorativi: mai come testo o sfondo di testo.

## 3. Tipografia
Font caricati in `src/app/_layout.tsx` (`@expo-google-fonts`): **Fredoka** 600/700 per i titoli, **Rubik** 400–700 per il resto. Ogni stile ha il suo `fontFamily` in `typography`.

| Token app | Size/Line | Font — uso |
|---|---|---|
| `hero` | 48/56 | Fredoka 700 |
| `display` | 40/48 | Fredoka 700 |
| `title1` | 32/38 | Fredoka 700 — titolo schermata, colore `heading` |
| `title2` | 20/26 | Fredoka 600 — titolo card |
| `stat` / `metric` | 24/28 · 32/36 | Fredoka, cifre tabular |
| `label` | 15/20 | Rubik 600 maiuscolo, spaziatura 0.8 — titoli di sezione |
| `headline` | 17/22 | Rubik 600 — righe, bottoni |
| `body` / `input` | 17/24 | Rubik 400 |
| `callout` | 15/20 | Rubik 500 — link, etichette |
| `caption` | 13/17 | Rubik 400 — metadati |
| `overline` | 13/16 | Rubik 700 maiuscolo — etichette dei campi, chip |
| `time` | 15/20 | Rubik 500, cifre tabular |
- Maiuscolo solo per bottoni, chip, etichette dei campi e titoli di sezione; mai nel testo.

## 4. Spaziatura, raggi, bordi
- **Spaziatura:** `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`. Margine laterale 16 (schermate) o 24 (onboarding), padding card 16.
- **Raggi:** sm 8 (checkbox) · md/lg/xl 12 (bottoni, campi, card, chip) · xxl 16 (sheet) · full (avatar, FAB, pill).
- **Bordi al posto delle ombre:** `shadowRaised` disegna il bordo 2 px + 4 px sotto delle card (ombre piene senza sfocatura), `shadowOverlay` un bordo 2 px. Nessuna ombra sfumata.

## 5. Componenti (`src/components/`)
### 5.1 `ScreenHeader`
Titolo `title1` a sinistra (o avatar + saluto `headline` in Home), a destra fino a 2 `IconButton`.
### 5.2 `Card` / `GradientCard`
Raggio 12, padding 16, `shadowRaised` (bordo 2 px, 4 px sotto).
### 5.3 ~~`EventRow`~~
Sostituita dalle card di `DayTimeline` (§5.7b, dec. 151).
### 5.4 `ListGroup` / `ListRow`
Riquadro con bordo 2 `border`, raggio 12; divisori 2 px a tutta larghezza. Riga alta ≥ 56: icona 24 senza riquadro, etichetta `headline`, dettaglio `caption`, chevron `borderBold`. Titolo del gruppo in `label` grigio. Stesso schema per `Section`/`Row` delle Impostazioni e per le Prossime scadenze in Home (cambia dec. 131).
### 5.5 Bottoni (`Button`, `IconButton`, `Fab`)
| Appearance | Uso | Colori |
|---|---|---|
| `primary` | l'azione principale, una per area | brand bold / bianco |
| `default` | azioni secondarie | contorno 2 `borderBold` (4 sotto), fondo `surface`, testo `link` |
| `subtle` | azioni terziarie, link-bottone | trasparente |
| `ink` | "Continua con Apple" | neutral.bold |
| `inverse` / `inverseSubtle` | sopra il viola pieno | bianco con testo viola / trasparente con testo bianco |
| `danger` / `warning` / `discovery` | conferme distruttive, cambi importanti, novità | semantici |
- Alti 48, raggio 12, testo `headline` 15 maiuscolo spaziato, icona 18 prima o dopo. **Tridimensionali:** bordo inferiore di 4 px nel colore scuro (`accentPressed` per il primary); premuto, il bordo sparisce e il bottone scende di 4 px senza spostare il resto. Disabilitato: piatto, neutral + `text.disabled`. Caricamento: spinner al posto del testo.
- `IconButton` primary: cerchio brand con bordo inferiore 3 px; gli altri solo icona.
- `Fab`: cerchio 56 brand con bordo inferiore 4 px, a 20 dal bordo, sopra la tab bar. Uno per schermata.
### 5.6 Lozenge (`Chip`)
Alta 24, raggio 12, testo `overline`, icona 12 facoltativa. Varianti: tinta per tipo, success, information, warning, danger, discovery, muted.
### 5.7 `DayStrip` (Agenda, dec. 151-152, 204)
Sopra, il titolo "Agenda" in `hero` (riga 60) centrato nella stessa posizione del giorno della Home, senza data (dec. 155). Settimana **da lunedì a domenica** a foglietti (dec. 204): sette colonne uguali con gap 8, foglietto `surface` raggio 8 con `shadowRaised`; fascia in alto col giorno breve `caption` 600 (fondo `selected`, testo `selectedText`; sabato e domenica fondo `dangerIcon` e testo `onAccent`), sotto il numero `stat` in un'area alta 44 (`text`; weekend `danger`; oggi `accent`). Giorno scelto: fascia `accent` con testo `onAccent`, foglietto `selected`, numero `accent`. Sotto, fino a 4 pallini 14 sovrapposti con i colori delle materie. Scorrendo di lato: settimana prima o dopo, con la striscia che segue il dito ed entra dal lato. Barra in alto come quella della Home (dec. 156): calendario a sinistra, pill "Oggi" accanto quando non si è su oggi, + a destra.
### 5.7b `DayTimeline` (Agenda, dec. 151, 157-158)
Solo eventi con orario. L'ora d'inizio sta **sulla linea del tempo** (colonna 72): pill `time` su una riga con bordo 2 `border` su `bg`; quando l'ora è passata, pill piena verde con testo bianco (dec. 205). Fra due orari sempre 4 pallini 6 (dec. 206), distribuiti nello spazio fra le pillole e mai sotto: ognuno è un momento fra i due orari, verde `#34C759` se passato, `textDisabled` se no (aggiornati ogni 30 s; tutti verdi nei giorni passati, grigi nei futuri). Impegno in corso: al posto dell'orario la pillola "Ora" verde, che scende col tempo; anche attorno a lei 4 pallini per lato, sopra verdi e sotto grigi (dec. 207). In cima alla linea l'alba (`sunrise` 26, `warningIcon`), in fondo il tramonto (`sunset` 26, `dangerIcon`), con 4 pallini verso il primo e l'ultimo orario (dec. 208). Card **piatta** `surface` raggio 12 senza bordo né ombra; icona del tipo 20 in un riquadro 40 tinto, titolo `headline`, orario `time` con l'orologio 14 e, a capo, l'aula con il segnaposto 14; lucchetto per le lezioni del docente.
### 5.7c `CalendarSheet` (Agenda, dec. 163)
Dall'icona del calendario in alto a sinistra. Foglio `surfaceOverlay` attaccato al bordo in basso, a tutta larghezza, angoli in alto raggio 32, maniglia 36×5, `shadowOverlay`, velo nero 0.3 dietro; trascinandolo giù si chiude (dec. 164), anche dalla lista della pagina del giorno quando è in cima. Header: mese `title2` con l'anno in `accent` e chevron (tocco = scelta di mese e anno: anno con frecce, 12 mesi in pill, quello attivo pieno `accent`), pill "Oggi" (fondo `selected`) quando non si è su oggi, bottone tondo 44 per chiudere. Griglia da lunedì: numero `stat` 20 in un cerchio 40 (giorno scelto pieno `accent`, oggi in `accent`), sotto i pallini delle materie; scorrendo di lato si cambia mese. Toccando un giorno (senza cambiare quello scelto nell'Agenda) il foglio si allarga fino in alto (fondo `bg`) e mostra la pagina del giorno, dove scorrendo di lato si va al giorno prima o dopo: indietro (freccia `ArrowLeft02`) e chiudi, numero in Fredoka 52 al centro, giorno della settimana e mese sotto, poi `DayTimeline`.
### 5.8 `Avatar`
Cerchio con iniziali (dec. 16) su `lesson.bg`, bordo 2 `surface`. Nel profilo: 128 con gradiente.
- **Avatar disegnato** (dec. 136, `src/components/avatar/`): disegni di react-nice-avatar (MIT) in un unico SVG 100×100; colori fissi in `avatarPalette`, sfondi pastello con testo `avatarPalette.ink`. Nel Profilo 200 senza sfondo proprio, sopra il fondo del suo colore.
- **Editor** (`/avatar`): schede con icona e barra brand sotto quella attiva; colori in riquadri 64 (raggio 16, bordo 2 con base 4), forme in griglia a 3 colonne con l'avatar inquadrato sulla parte che cambia. Selezionato = bordo `borderFocused` + fondo `selected`.
- **Codice QR** (`/qr`): card `surfaceOverlay` raggio 16 su `blanket`; QR sempre scuro su bianco (`qrColors`), moduli a puntini, occhi e allineamento arrotondati e pieni, avatar al centro; azioni quadrate 72 con etichetta sotto.
### 5.9 Profilo social
Pill interesse (44, bordo 1.5, icona in quadratino tinto), righe azione (cerchio 48), "Profilo privato" come lozenge (dec. 15). Niente spunte "verificato".
### 5.10 `TextField`
Etichetta `overline` sopra; campo alto 48, raggio 12, fondo `surfaceMuted` con bordo 2 `border`; focus = fondo `surface` + bordo `borderFocused`; errore = bordo danger + icona e messaggio sotto. Stesso stile per i campi di ricerca e la barra della chat. Testo di aiuto `caption` subtlest.
### 5.11 `SectionMessage`
Fondo semantico, icona 20 colorata, titolo `headline` facoltativo, testo `callout`. Raggio 8, padding 16.
### 5.12 `ProgressBar`
Alta 16, raggio pieno, traccia `border`, riempimento brand animato (400 ms, out.expo) con un riflesso chiaro di 4 px in alto.
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
| Benvenuto | ON-01 | viola pieno, nome Gradie, titolo bianco, mascotte `celebrate`, `inverse` "Inizia" + `inverseSubtle` "Ho già un account" |
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

## 9b. Niente vetro
| Elemento | Aspetto |
|---|---|
| Tab bar | `FloatingTabBar` anche su iOS e Android (dec. 223): pillola piatta `surface` con bordo 2, **solo icone**; voce attiva su fondo `selected` con icona `accent`. Col menu della Home aperto si sposta e si scurisce con la Home |
| `Glass` | superficie piatta `surface` con bordo 2 (o tinta piena se ha `tint`) |
| Form sheet e menu nativi | restano di sistema (iOS) |

## 10. Divieti
- Niente gamification: punti, badge, streak, sfide, classifiche (dec. 57).
- Niente asset copiati dalle ispirazioni (mascotte, illustrazioni, loghi, testi). Niente logo o marchio Atlassian. L'unica mascotte è quella di Gradie.
- **Icone: solo Hugeicons** (set gratuito Stroke Rounded, tratto 2), sempre tramite `Icon` di `src/components/icons.tsx` (dec. 159); per un'icona nuova si aggiunge una voce alla tabella `ICONS`. Indietro è sempre la freccia `ArrowLeft02` (dec. 164). La tab bar nativa usa le stesse icone in PNG (`assets/tabs`).
- Niente emoji come icone. Niente MAIUSCOLO nel testo (solo bottoni, chip, etichette e titoli di sezione). Niente ombre sfumate, gradienti o vetro disegnato. Niente più di un primary per area.
- Niente font, loghi o illustrazioni di Duolingo: è solo l'ispirazione dello stile.
- Niente widget riordinabili in Home (dec. 21), niente temi utente (dec. 49), niente presenze (dec. 97).

## 11. Decisioni di design aperte
1. ~~Colori per materia~~ → sì nell'Agenda, dal colore del quaderno (dec. 151). Da decidere se usarli anche altrove.
2. Illustrazioni: tenere `OrbitArt` o commissionare uno stile illustrato proprio?
3. ~~Logo e nome~~ → deciso: Gradie (dec. 114). Serve il logo in alta risoluzione / vettoriale originale per l'icona finale (ora ricavata dall'immagine inviata, ~770 px).
4. Layout per iPad (priorità alta per gli appunti, dec. 28).
5. A che ora arriva il promemoria "il giorno prima" (dec. 107).
6. Profilo social: @handle, istituto/città/link visibili? Chi vede contatori e interessi con profilo privato?
9. Link del profilo condiviso (QR, "Condividi link"): serve un dominio web; ora `gradie://u/1234`.
7. Onboarding: requisiti reali della password (ora "almeno 8 caratteri" come segnaposto), testi dei consensi, durata del "Reinvia" (ora 30 s), ordine Apple/Google/Email.
8. Onboarding: suggerimenti di materie per indirizzo (ora elenco dimostrativo) e date del periodo didattico (non ancora chieste).
