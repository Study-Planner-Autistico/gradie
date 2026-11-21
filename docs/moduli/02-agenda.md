# Modulo 02 — Agenda ed eventi

> Stato: **specifica v1**. Si basa sul briefing (dec. 1–61), sul modulo 01 e sulle decisioni 89–98 (`docs/decisioni.md`).
> Legenda: ✅ confermato · 🔧 proposta da validare · ⏸ rinviato · ❓ domanda aperta (§8)

---

## 0. Esito delle tensioni del primo giro

| # | Tensione | Esito |
|---|---|---|
| A1 | Confine tra Agenda e Attività | ✅ Attività gestisce, l'Agenda mostra (dec. 89) |
| A2 | Promemoria senza push | ✅ Notifiche locali del telefono più centro notifiche interno (dec. 94, modifica dec. 43) |
| A3 | Inviti tra istituti diversi | ✅ Non permessi (dec. 92). Effetto sulla Community → §8 |
| A4 | Eventi ufficiali e controllo personale | ✅ Compaiono da soli, l'organizzatore vede le risposte (dec. 93). Nascondere o annotare → §8 |
| A5 | Orario delle lezioni | ✅ Modello diverso per superiori e università/AFAM (dec. 90) |
| A6 | Festività e vacanze | ✅ Festività nazionali incluse, vacanze regionali dalla scuola (dec. 96, interpretazione → §8) |
| A7 | Presenze | ✅ Escluse (dec. 97) |
| A8 | Orario del docente nell'Agenda dello studente | Aperta → §8 |
| A9 | AI | ✅ Nel modulo AI (dec. 98) |

---

## 1. Confine del modulo e requisiti confermati

L'Agenda è la **vista nel tempo dell'ambiente attivo** (istituto), dove compaiono:

| Elemento | Chi lo gestisce | In Agenda |
|---|---|---|
| **Lezione** (dall'orario) | Agenda | Si crea, modifica ed elimina qui |
| **Appuntamento**, anche non scolastico (dec. 91) | Agenda | Si crea, modifica ed elimina qui; si possono invitare persone dello stesso istituto |
| **Evento ufficiale** di classe o gruppo | Classi/Gruppi (chi lo crea → §8) | Compare da solo (dec. 93); lo studente risponde |
| **Compito, verifica, interrogazione, esame, progetto, consegna, scadenza** | **Attività** (dec. 89) | Solo visualizzazione con link al modulo Attività |
| **Festività nazionali** e **vacanze regionali** | Dati caricati dal team (dec. 96) | Solo visualizzazione; le lezioni ricorrenti in quei giorni vengono sospese |

**Fuori dal modulo:**
- Gestione delle attività (modulo Attività).
- Creazione di classi e gruppi (modulo Classi).
- Chat (modulo Messaggi).
- AI (modulo AI, dec. 98).
- Importazione (dec. 83).
- Viste del calendario (rinviate, dec. 95).
- Presenze (escluse, dec. 97).

**Requisiti:**
- AG-R1 — Tutto quello che compare in Agenda appartiene **a un solo ambiente**. Gli inviti si possono mandare solo a persone dello stesso istituto (dec. 62, 64, 92).
- AG-R2 — Un elemento di Attività non viene mai duplicato: l'Agenda mostra sempre la versione aggiornata (dec. 89).
- AG-R3 — I promemoria arrivano sia come **notifica locale del telefono** sia nel **centro notifiche** (dec. 94). Ogni categoria si può disattivare (dec. 44).
- AG-R4 — Offline: consultazione dell'Agenda già scaricata, nessuna modifica (dec. 54).
- AG-R5 — Eventi e appuntamenti personali sono privati per default. Il docente vede solo le risposte agli eventi che ha organizzato lui (dec. 15, 37, 93).

---

## 2. Utenti e responsabilità

| Attore | Cosa fa |
|---|---|
| **Studente superiori** | Inserisce l'orario settimanale, aggiunge appuntamenti, risponde agli inviti, vede attività ed eventi ufficiali |
| **Studente università/AFAM** | Inserisce le lezioni per insegnamento con il loro periodo, appuntamenti, ricevimenti 🔧 |
| **Docente** | Ha la sua Agenda in ogni ambiente (scuola, dec. 73): le lezioni che tiene e gli eventi che organizza |
| **Organizzatore** (chiunque inviti, o il creatore di un evento ufficiale) | Crea l'evento, invita, vede le risposte (dec. 93), lo modifica o annulla |
| **Partecipante** | Riceve, risponde, vede l'evento nella propria Agenda |
| **Team interno** | Carica ogni anno festività e calendari regionali (dec. 96) |

---

## 3. User journey essenziali

**J1 — Configurare l'orario (superiori, dec. 90)**
Agenda → "Imposta orario" → griglia settimanale (Lun–Sab 🔧) → per ogni ora: materia (dall'elenco del modulo 01), inizio e fine, aula e docente facoltativi (testo libero 🔧) → valido per il **periodo didattico** corrente → salva. Le lezioni si ripetono ogni settimana, tranne nelle festività e nelle vacanze.

**J2 — Inserire le lezioni (università/AFAM, dec. 90)**
Agenda → "Aggiungi lezioni" → insegnamento → giorni e orari della settimana → data di inizio e fine (es. il semestre) → aula facoltativa → salva. Si ripete per ogni insegnamento.

**J3 — Eccezione su una lezione**
Tap sulla lezione → "Solo questa": annulla, sposta o cambia aula → oppure "Da qui in poi": modifica tutte le lezioni successive.

**J4 — Nuovo appuntamento** (anche non scolastico, dec. 91)
"+" → Appuntamento → titolo, data, ora o tutto il giorno, luogo e note facoltativi, materia facoltativa, promemoria → eventuali invitati (solo dello stesso istituto, dec. 92) → salva. Gli invitati ricevono una notifica.

**J5 — Ricevere un invito**
Notifica (locale e nel centro notifiche) → dettaglio → risposta (opzioni → §8) → se accettato, compare in Agenda. L'organizzatore vede la risposta (dec. 93).

**J6 — Evento ufficiale di classe o gruppo**
Il creatore lo pubblica → compare **in automatico** nell'Agenda dei membri (dec. 93), con notifica. Se viene modificato o annullato, l'Agenda si aggiorna e arriva una notifica di modifica.

**J7 — Elemento di Attività in Agenda**
Una verifica creata in Attività compare nel giorno giusto con un aspetto riconoscibile come "attività" → tap → si apre il dettaglio nel modulo Attività (dec. 89).

**J8 — Promemoria**
Si sceglie l'anticipo (valore predefinito → §8) → all'ora stabilita arriva la notifica locale e una voce nel centro notifiche. Se l'utente ha negato il permesso per le notifiche del telefono, il promemoria arriva solo nel centro, con un avviso che suggerisce di attivare il permesso.

**J9 — Nuovo periodo o nuovo anno**
Quando cambia il periodo (es. inizia il 2° quadrimestre) o l'anno (passaggio proposto con conferma, dec. 75), l'app propone di **ricopiare l'orario** con conferma 🔧, oppure di impostarne uno nuovo.

**J10 — Offline**
Si consulta l'Agenda già scaricata. Le azioni di creazione e modifica sono disattivate e compare il banner "Sei offline" (dec. 54).

**Casi limite**
- Invito a una persona di un altro istituto: non possibile, perché la ricerca degli invitati mostra solo persone dello stesso ambiente (dec. 92).
- Lezione ricorrente in un giorno di festa: viene sospesa e compare un'etichetta "Festività" o "Vacanza".
- Eventi sovrapposti: sono permessi e si vedono affiancati 🔧.
- Evento ufficiale annullato dopo che lo studente l'aveva accettato: lo si vede barrato con "Annullato" per un periodo 🔧, poi sparisce.
- Utente che lascia una classe: i suoi eventi ufficiali spariscono dalla sua Agenda 🔧.
- Orario inserito a mano dallo studente e orario ufficiale del docente (A8) → §8.

---

## 4. Inventario concettuale dei dati

| Entità | Campi concettuali | Note |
|---|---|---|
| **Evento** | ambiente, tipo (lezione/appuntamento/ufficiale), titolo, inizio, fine, tutto il giorno, luogo, note, materia, organizzatore, stato (attivo/annullato) | Gli elementi di Attività **non** sono eventi: sono riferimenti (dec. 89) |
| **Ricorrenza** | regola settimanale, giorni, data di inizio e fine (o periodo didattico), eccezioni | Superiori: legata al periodo. Università: legata all'insegnamento (dec. 90) |
| **Eccezione** | data, tipo (annullata/spostata/modificata), nuovi valori | — |
| **Invito / Partecipazione** | evento, persona, risposta, data della risposta | L'organizzatore la vede (dec. 93) |
| **Promemoria** | evento o attività, anticipo, canali (notifica locale + centro) | dec. 94 |
| **Festività** | data, nome, ambito (nazionale) | dec. 96 |
| **Vacanza regionale** | regione, anno scolastico, periodo, nome | Fonte → §8 |
| **Riferimento attività** | id dell'attività, data, tipo | Letto dal modulo Attività |

---

## 5. Mappa delle schermate (mobile-first)

| ID | Schermata | Contenuto |
|---|---|---|
| AG-01 | **Agenda** (voce della barra) | Vista del calendario (tipo ⏸ dec. 95), elenco degli elementi del giorno, "+" |
| AG-02 | Dettaglio evento | Dati, materia, promemoria, partecipanti (se organizzatore), azioni |
| AG-03 | Nuovo / modifica appuntamento | Modulo del J4 |
| AG-04 | Imposta orario (superiori) | Griglia settimanale per periodo |
| AG-05 | Lezioni per insegnamento (università/AFAM) | Elenco insegnamenti → orari ricorrenti con date |
| AG-06 | Modifica lezione | "Solo questa" / "Da qui in poi" |
| AG-07 | Invita persone | Ricerca **solo nell'istituto** (dec. 92) |
| AG-08 | Risposta all'invito | Dettaglio e opzioni di risposta |
| AG-09 | Partecipanti (organizzatore) | Elenco con le risposte (dec. 93) |
| AG-10 | Calendario dell'anno | Festività e vacanze regionali dell'istituto (consultazione) |

- Il **"+"** propone: Appuntamento · Lezione · Attività (porta al modulo Attività, dec. 89).
- **Home**: "Oggi" mostra lezioni, appuntamenti, eventi ufficiali e attività del giorno; "Prossime scadenze" mostra le attività (dati del modulo Attività).
- **Prototipo da correggere:** togliere "Svolta/Non svolta" dalle card delle lezioni (dec. 97).

---

## 6. Stati

| Schermata | Vuoto | Caricamento | Errore | Offline | Privacy |
|---|---|---|---|---|---|
| AG-01 Agenda | "Nessun impegno oggi" + "Imposta il tuo orario" se l'orario manca | Skeleton delle card | Errore di sincronizzazione + "Riprova" | Consultazione, "+" disattivato | Badge "Privato" sugli appuntamenti personali |
| AG-04/05 Orario | Griglia vuota con suggerimento | — | Orari sovrapposti nella stessa ora (avviso, non blocco 🔧) | Non disponibile | — |
| AG-07 Invita | "Nessuna persona trovata in questo istituto" | Ricerca | — | Non disponibile | Mostra solo nome e cognome (dec. 16, 37) |
| AG-09 Partecipanti | "Nessuna risposta ancora" | Skeleton | — | Ultimo dato scaricato | Visibile solo all'organizzatore 🔧 |
| Promemoria | — | — | Permesso notifiche negato → avviso | Le notifiche locali funzionano anche offline 🔧 | — |

---

## 7. Dipendenze

| Modulo | Rapporto |
|---|---|
| **01 Fondazioni** | Fornisce ambiente, periodo didattico, materie e insegnamenti, regione dell'istituto (per le vacanze) |
| **Attività** | L'Agenda legge e mostra le sue attività (dec. 89) |
| **Classi / Gruppi** | Fornisce gli eventi ufficiali e i membri (all'interno di un solo istituto, dec. 92) |
| **Notifiche** | Notifiche locali più centro notifiche (dec. 43, 94) |
| **Home** | Blocchi "Oggi" e "Prossime scadenze" |
| **AI** | Funzioni progettate nel modulo AI (dec. 98) |
| **Community** | Effetto della dec. 92 da valutare → §8 |

---

## 8. Decisioni aperte

**H1 — Risposte a un invito.**
- **A.** Sì / No.
- **B.** Sì / No / Forse.

**H2 — Chi crea gli eventi ufficiali?**
- **A.** Solo il docente, nelle sue classi.
- **B.** Il docente più gli amministratori dei gruppi (ruoli del modulo Classi).
- **C.** Qualunque membro, con approvazione.

**H3 — Vacanze regionali "dalla scuola" (dec. 96).** Ho interpretato: la regione si ricava dall'istituto e il team carica ogni anno il calendario scolastico regionale. Le regioni lo pubblicano, ma non ho verificato in che formato. È corretto, oppure intendevi che le **vacanze le inserisce la scuola** (cioè il docente o l'istituto)? Va chiarito anche se si possono aggiungere i giorni decisi dal singolo istituto (ponti, chiusure).

**H4 — Orario ufficiale del docente nell'Agenda dello studente** (A8). Se lo studente è collegato a una classe in cui il docente ha inserito le lezioni:
- **A.** L'orario ufficiale **sostituisce** quello personale per quella classe.
- **B.** Lo studente sceglie se usare l'orario ufficiale o il suo.
- **C.** Nessun collegamento: l'orario resta sempre personale.

**H5 — Lo studente può nascondere un evento ufficiale?** (A4)
- **A.** No, si può solo rispondere.
- **B.** Sì, lo nasconde dalla sua Agenda (l'organizzatore vede comunque la risposta).

**H6 — Anticipo predefinito dei promemoria.**
- **A.** Nessun promemoria predefinito: lo sceglie l'utente.
- **B.** Valori predefiniti per tipo (es. 1 giorno prima per una verifica, 15 minuti prima di un appuntamento).

**H7 — Effetto della dec. 92 sulla Community.** Gruppi e inviti sono limitati a un istituto. Il briefing però prevede anche **community pubbliche/tematiche** (dec. 14, 30) e un feed algoritmico (dec. 32), che per natura riuniscono persone di scuole diverse. La dec. 92 vale anche per la Community? (Basta una prima indicazione; il dettaglio va nel modulo Community.)

**H8 — Elenco partecipanti visibile agli altri invitati?**
- **A.** No, lo vede solo l'organizzatore (dec. 93).
- **B.** Sì, tutti i partecipanti vedono chi ha accettato.

---

## 9. Priorità

**MVP** (confermato):
- Orario superiori (griglia per periodo) e lezioni per insegnamento per università/AFAM, con eccezioni.
- Appuntamenti personali, anche non scolastici, con inviti nello stesso istituto e risposte visibili all'organizzatore.
- Eventi ufficiali che compaiono da soli.
- Elementi di Attività mostrati in Agenda.
- Festività nazionali e vacanze regionali.
- Promemoria con notifiche locali più centro notifiche.
- Consultazione offline.
- Blocchi "Oggi" e "Prossime scadenze" della Home.

**Rinviati:** viste del calendario (dec. 95), AI (dec. 98), importazione (dec. 83).

**Esclusi:** presenze (dec. 97), gruppi tra istituti diversi (dec. 92), calendari esterni (dec. 58).
