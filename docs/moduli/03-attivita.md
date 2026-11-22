# Modulo 03 — Attività

> Stato: **bozza v1, in attesa di decisioni** (§8). Si basa sul briefing (dec. 1–61), sui moduli 01 e 02 e sulle decisioni 89 e 109–113 (`docs/decisioni.md`).
> Legenda: ✅ confermato · 🔧 proposta da validare · ⏸ rinviato · ❓ domanda aperta (§8)

---

## 0. Tensioni da sciogliere prima di tutto

| # | Tensione | Perché conta |
|---|---|---|
| T1 | **Due anime nello stesso modulo.** La dec. 25 fa di Attività il sistema per compiti, verifiche, interrogazioni, esami, progetti e scadenze. La dec. 109 ci aggiunge gli **appunti** (note, lavagna). La schermata attuale mostra solo le note. | Bisogna decidere dove stanno compiti e verifiche nella schermata, e se gli appunti restano qui o tornano nel modulo "Materiali e appunti" previsto dal briefing. |
| T2 | **"Video di YouTube" e integrazioni.** La dec. 58 esclude le integrazioni di terze parti; l'azione rapida della dec. 109 ne è una. | Va chiarito cosa fa (incolla un link? riproduce il video dentro l'app?) e se è un'eccezione approvata alla dec. 58. |
| T3 | **Compiti assegnati dal docente.** Il docente assegna compiti e verifiche alla classe (dec. 36), lo studente li gestisce in privato (dec. 37). | Serve una regola come per gli eventi ufficiali: compaiono da soli? Lo studente può modificarli o nasconderli? Il docente vede chi li ha completati? |
| T4 | **Legame con il Registro voti.** Una verifica o un esame produce un voto, ma i voti sono solo dello studente (dec. 36–37). | Va deciso se dall'attività si passa al voto (proposta 🔧: al termine di una verifica l'app propone "Aggiungi il voto", visibile solo allo studente). |
| T5 | **Quaderno digitale (dec. 29) vs MVP.** Registrazioni audio sincronizzate, ricerca nella scrittura a mano e collaborazione in tempo reale sono molto costose. | Va decisa la fase di ciascuna funzione. |
| T6 | **Offline (dec. 54).** Le modifiche offline non sono confermate, ma una lavagna che non si può usare senza rete è un limite forte per appunti a lezione. | Va decisa un'eccezione per gli appunti o confermata la sola consultazione. |

---

## 1. Confine del modulo e requisiti confermati

Attività è il posto dove lo studente **gestisce il lavoro scolastico dell'ambiente attivo**:

| Elemento | Stato | Note |
|---|---|---|
| **Compito** (per casa) | ✅ dec. 25 | Materia, data di consegna, descrizione |
| **Verifica** (scritta) e **interrogazione** (orale) | ✅ dec. 25 | Superiori (modulo 01: percorso verifiche/interrogazioni) |
| **Esame** e **appello** | ✅ dec. 25 | Università/AFAM (modulo 01: percorso esami/appelli) |
| **Progetto / lavoro di gruppo** | ✅ dec. 25 | Con altre persone dello stesso istituto (dec. 92) 🔧 |
| **Consegna** e **scadenza** | ✅ dec. 25 | ❓ Differenza da chiarire (§8, D3) |
| **Note e lavagna** | ✅ dec. 109–113 | Già progettate a livello di interfaccia |
| Azioni rapide **Importa file**, **Video di YouTube** | ❓ dec. 109 | Comportamento non definito (§8, D2) |

**Fuori dal modulo:**
- Visualizzazione nel tempo (Agenda, dec. 89).
- Voti e medie (Registro voti, dec. 26).
- Archivio dei materiali (Materiali, dec. 27), salvo diversa decisione su T1.
- Creazione di classi e gruppi (Classi).
- AI (modulo AI, come per l'Agenda, dec. 98) 🔧.

**Requisiti:**
- AT-R1 — Ogni attività appartiene **a un solo ambiente** (dec. 62, 64).
- AT-R2 — L'Agenda mostra le attività senza duplicarle (dec. 89, AG-R2).
- AT-R3 — Promemoria predefinito **il giorno prima**, con notifica locale e centro notifiche (dec. 94, 104, 107).
- AT-R4 — Il percorso decide i tipi disponibili: superiori → compiti, verifiche, interrogazioni; università/AFAM → esami, appelli (modulo 01) 🔧.
- AT-R5 — Lo stato personale di un'attività (fatto, in corso, voto) è privato dello studente (dec. 15, 37).
- AT-R6 — Niente punti, streak o classifiche per le attività completate (dec. 57).

---

## 2. Utenti e responsabilità

| Attore | Cosa fa |
|---|---|
| **Studente superiori** | Crea compiti, verifiche, interrogazioni; segna come fatto; prende appunti |
| **Studente università/AFAM** | Crea esami e appelli, progetti; prende appunti |
| **Docente** | Assegna compiti e verifiche alle sue classi ❓ (§8, D4) |
| **Compagni di gruppo** | Condividono un progetto ❓ (§8, D6) |

---

## 3. User journey essenziali

- **J1 — Aggiungere una verifica.** "+" → Verifica → materia (dal percorso), data, argomenti → salva → compare in Agenda e in Home "Prossime scadenze".
- **J2 — Segnare un compito come fatto.** Dall'elenco, tocco sul cerchio → fatto (si sposta in "Completati"); si può annullare.
- **J3 — Compito assegnato dal docente** ❓. Il docente lo crea per la classe → lo studente lo trova nell'elenco con l'etichetta "Dal docente".
- **J4 — Esame universitario.** "+" → Esame → insegnamento, appello (data), stato (da sostenere / prenotato / superato) → a esame superato l'app propone di registrare il voto (T4).
- **J5 — Prendere appunti.** Azione rapida "Prendi appunti" → nuova nota → lavagna (dec. 110–113).
- **J6 — Collegare una nota a un'attività** 🔧. Dalla verifica → "Appunti collegati" → sceglie una nota esistente o ne crea una.

**Casi limite**
- Attività con data passata non completata → resta in "In ritardo" finché non si segna fatta o si elimina 🔧.
- Cambio di ambiente → si vedono solo le attività del nuovo ambiente (AT-R1).
- Materia eliminata dal percorso → le attività restano, con la materia indicata come "non più nel percorso" 🔧.

---

## 4. Inventario concettuale dei dati

| Entità | Campi principali | Note |
|---|---|---|
| **Attività** | ambiente, tipo, titolo, materia/insegnamento, data (e ora facoltativa), descrizione, argomenti, allegati, origine (personale / dal docente), stato personale, promemoria | Letta dall'Agenda (dec. 89) |
| **Esame** (estende Attività) | appello, stato (da sostenere / prenotato / superato / non superato), CFU 🔧 | Il voto vive nel Registro voti |
| **Sotto-attività** 🔧 | testo, fatto | Per progetti e compiti lunghi |
| **Nota** | nome, copertina, carta, formato, pagine, miniatura, materia 🔧 | dec. 111–113 |
| **Collegamento** 🔧 | nota ↔ attività | J6 |

---

## 5. Mappa delle schermate (proposta 🔧)

- **AT-01 Attività** (tab): in alto le **azioni rapide** (dec. 109); poi una sezione **"Da fare"** con le prossime attività raggruppate per Oggi / Questa settimana / Più avanti; poi **Note** (dec. 111). Il "+" (dec. 112) chiede: Nota · Compito · Verifica / Esame · Progetto.
- **AT-02 Dettaglio attività**: titolo, tipo, materia, data, descrizione, sotto-attività, appunti collegati, promemoria.
- **AT-03 Nuova attività** (form sheet): campi in base al tipo.
- **AT-04 Tutte le attività**: filtri per tipo, materia e stato (in ritardo, da fare, completate).
- **AT-05 Nuova nota** e **AT-06 Lavagna**: già definite (dec. 110–113).

---

## 6. Stati

- **Vuoto:** nessuna attività → mascotte addormentata con "Niente da fare. Aggiungi un compito o una verifica" + bottone.
- **Caricamento:** scheletri delle righe.
- **Errore di sincronizzazione:** messaggio non bloccante, le attività locali restano visibili.
- **Offline:** consultazione; modifica ❓ (T6).
- **Privacy:** lo stato personale non è mai visibile al docente salvo diversa decisione (D4).

---

## 7. Dipendenze

| Modulo | Rapporto |
|---|---|
| **01 Fondazioni** | Ambiente, percorso (tipi disponibili), materie e insegnamenti |
| **02 Agenda** | Mostra le attività (dec. 89) |
| **Registro voti** | Riceve il voto da verifiche ed esami (T4) |
| **Materiali** | Allegati e file importati (T1) |
| **Classi** | Compiti assegnati dal docente, progetti di gruppo |
| **Home** | "Prossime scadenze", "Ultime attività" |
| **Notifiche** | Promemoria (dec. 94) |

---

## 8. Decisioni aperte

| # | Domanda | Alternative |
|---|---|---|
| D1 | Gli appunti restano in Attività (dec. 109) o tornano in un modulo Appunti separato? | **a)** restano in Attività, che diventa "compiti + appunti" · **b)** tab separata · **c)** dentro Materiali |
| D2 | Cosa fanno "Importa file" e "Video di YouTube"? | **a)** il file diventa una nota annotabile (PDF/immagine); YouTube = solo link salvato · **b)** YouTube riprodotto in app (integrazione: deroga alla dec. 58) · **c)** togliere YouTube |
| D3 | "Consegna" e "scadenza" sono tipi diversi da "compito"? | **a)** unirli in "Compito" con data di consegna · **b)** tenerli distinti |
| D4 | Compiti e verifiche del docente | **a)** compaiono da soli, lo studente non li modifica, il docente **non** vede chi li completa · **b)** come a) ma il docente vede chi li ha completati (serve consenso, dec. 37) · **c)** niente assegnazioni nell'MVP |
| D5 | Lo studente può nascondere o eliminare un compito del docente? | sì / no (per gli eventi ufficiali è no, dec. 103) |
| D6 | Progetti di gruppo condivisi tra studenti | **a)** sì, con sotto-attività assegnabili · **b)** solo personali nell'MVP |
| D7 | Voto da verifiche ed esami | **a)** l'app propone di aggiungere il voto al termine · **b)** nessun collegamento, si inserisce nel Registro |
| D8 | Appunti offline | **a)** si possono creare e modificare offline e si sincronizzano dopo (eccezione alla dec. 54) · **b)** solo consultazione |
| D9 | Quaderno digitale (dec. 29): cosa entra nell'MVP? | audio sincronizzato · ricerca nella scrittura · collaborazione in tempo reale · annotazione PDF · esportazione PDF (già fatta, dec. 113) |
| D10 | Il quarto strumento della lavagna (dec. 110, rinviato) | da definire ora o più avanti |

---

## 9. Priorità (proposta 🔧, da confermare dopo §8)

**MVP:** compiti, verifiche, interrogazioni, esami; stato fatto / da fare; promemoria; visualizzazione in Agenda e Home; note e lavagna come da dec. 110–113.
**Da decidere:** assegnazioni del docente (D4), progetti condivisi (D6), YouTube (D2), funzioni avanzate del quaderno (D9).
