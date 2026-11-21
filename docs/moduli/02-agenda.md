# Modulo 02 — Agenda ed eventi

> Stato: **apertura del modulo** (vincoli, tensioni, piano, domande). Nessuna decisione nuova è stata presa qui.
> Legenda: ✅ confermato · 🔧 da progettare · ⏸ rinviato · ❓ domanda aperta (§4)
> Si basa sul modulo 01 (ambiente = istituto, periodo didattico, materie), che fornisce gli elementi di partenza.

**Perché viene subito dopo Fondazioni:** l'Agenda è la vista temporale di tutto il resto. Attività, verifiche, esami, eventi di classe e la sezione "Oggi" della Home si appoggiano su di lei.

---

## 1. Vincoli recepiti (✅)

**Cosa contiene l'Agenda**
- È un calendario accademico che riunisce lezioni e orari, compiti, verifiche e interrogazioni, esami, scadenze e appuntamenti (dec. 22).
- È una delle 5 voci fisse della barra inferiore (dec. 19). La Home mostra "Oggi" e "Prossime scadenze" (dec. 17, 20).

**Inserimento e condivisione**
- Gli eventi si inseriscono **a mano**, oppure arrivano da **inviti e condivisioni** di classi, gruppi e chat (dec. 23).
- Nessuna importazione automatica obbligatoria da calendari o documenti (dec. 23).
- Siri, assistenti vocali e calendari esterni sono esclusi (dec. 58, 67).
- Gli eventi condivisi seguono un sistema ibrido: eventi personali con inviti, ed eventi ufficiali di classe o gruppo. La partecipazione è gestita e gli eventi compaiono nell'Agenda personale (dec. 24).
- Classi e gruppi hanno un loro calendario di eventi (dec. 35). Il docente gestisce lezioni e orari (dec. 36).

**Ambienti e periodo**
- L'Agenda vive **dentro l'ambiente**, cioè l'istituto. Non esiste una vista che unisca più ambienti (dec. 62, 64).
- Usa il periodo didattico e le materie configurati in onboarding (dec. 69). Il passaggio d'anno viene proposto con conferma (dec. 75).

**Automazioni, AI e notifiche**
- Le automazioni sono semi-automatiche: l'utente conferma (dec. 6). L'AI è Premium e disponibile anche in Agenda, sempre con conferma (dec. 38, 39).
- Le notifiche passano **solo dal centro notifiche interno**: niente push, niente email (dec. 43). Ogni categoria si può disattivare (dec. 44).

**Dati e privacy**
- Offline: l'Agenda già caricata si può consultare, ma non modificare (dec. 54). Sincronizzazione automatica, gestione dei conflitti ⏸ (dec. 55).
- Eventi personali privati per default (dec. 15). I docenti vedono solo lo stretto necessario (dec. 37).

---

## 2. Ambiguità e tensioni reali

| # | Tensione | Perché conta |
|---|---|---|
| A1 | **Confine tra Agenda e Attività.** La dec. 22 mette compiti, verifiche, esami e scadenze *nell'Agenda*. La dec. 25 crea un *sistema dedicato* per gli stessi tipi. | Se non si decide chi è il "proprietario" dei dati, ci sono doppioni o elementi che non coincidono. |
| A2 | **Promemoria senza notifiche push.** Con il solo centro notifiche interno (dec. 43), l'utente scopre un promemoria solo se apre l'app. | Un'agenda senza avvisi ad app chiusa è molto meno utile. Le notifiche locali del telefono non sono un servizio di terze parti, ma la dec. 43 dice "nessuna push confermata". |
| A3 | **Eventi condivisi e ambienti isolati.** Un gruppo di studio privato o una community può riunire studenti di istituti diversi (dec. 14). In quale ambiente finisce un invito? | Con ambiente = istituto (dec. 62) e nessuna vista aggregata (dec. 64), un invito "trasversale" non ha un posto ovvio. |
| A4 | **Eventi ufficiali contro controllo personale.** Gli eventi di classe vengono "visualizzati nell'Agenda personale" (dec. 24). Lo studente li può nascondere, annotare o rifiutare? | Riguarda autonomia e privacy: le risposte dello studente ("non partecipo") sono visibili al docente? (dec. 37) |
| A5 | **Orario delle lezioni.** Alle superiori è settimanale e ricorrente; all'università varia per semestre e insegnamento, e per le AFAM ancora di più. | Serve un modello di ricorrenza adatto a entrambi i percorsi. |
| A6 | **Calendario scolastico e festività.** Vacanze e festività cambiano da regione a regione. Senza saperle, le lezioni ricorrenti compaiono anche nei giorni di vacanza. | O si usano dati esterni caricati periodicamente (come per gli istituti, dec. 86), o li inserisce l'utente. |
| A7 | **Presenze sulla lezione.** L'immagine di riferimento e il prototipo mostrano "Svolta/Non svolta" sulle card. Le presenze sono confermate **solo come strumento del docente** (dec. 36). | Non va inventata una funzione "presenze personali" dello studente: va decisa. |
| A8 | **Lezioni del docente nell'Agenda dello studente.** Il docente gestisce lezioni e orari (dec. 36). Se lo studente è collegato, quell'orario entra nella sua Agenda? E se ha già inserito il suo a mano? | Rischio di doppioni e di conflitti tra orario personale e orario ufficiale. |
| A9 | **AI in Agenda.** Prevista (dec. 38), ma è Premium e i contenuti dell'offerta sono rinviati (dec. 42). | Va deciso se la si progetta in questo modulo o nel modulo AI. |

---

## 3. Piano del modulo

### 3.1 Confine proposto 🔧
**Dentro:**
- Viste del calendario.
- Lezioni e orario (personale e, se collegato, ufficiale).
- Eventi e appuntamenti personali.
- Visualizzazione degli elementi di Attività (secondo la risposta a G1).
- Eventi condivisi: inviti, eventi ufficiali, partecipazione.
- Promemoria (secondo la risposta a G6).
- Calendario scolastico e festività (secondo la risposta a G8).
- Comportamento offline.
- Blocchi "Oggi" e "Prossime scadenze" della Home.

**Fuori:**
- Gestione dettagliata di compiti, verifiche ed esami (modulo Attività).
- Creazione di classi e gruppi (modulo Classi).
- Chat (modulo Messaggi).
- AI (modulo AI, salvo diversa risposta a G10).
- Importazione (rinviata, dec. 83).

### 3.2 Cosa produrrò dopo le risposte
Gli stessi 9 punti del modulo 01:
1. confine;
2. utenti;
3. percorsi d'uso, per esempio inserire l'orario, aggiungere un appuntamento, ricevere e accettare un invito, evento ufficiale modificato o annullato, cambio di periodo o anno, consultazione offline;
4. dati concettuali, per esempio evento, ricorrenza ed eccezioni, lezione, invito e partecipazione, promemoria, periodo di vacanza;
5. mappa delle schermate, per esempio Agenda giorno/settimana/mese, dettaglio evento, nuovo evento, configurazione dell'orario;
6. stati;
7. dipendenze;
8. decisioni residue;
9. priorità MVP.

---

## 4. Domande necessarie

**G1 — Chi possiede compiti, verifiche ed esami?** (A1)
- **A.** Li possiede il modulo **Attività**; l'Agenda li **mostra** nel calendario. *Pro:* una sola fonte, niente doppioni. *Contro:* l'Agenda dipende da Attività.
- **B.** L'Agenda gestisce date e scadenze; Attività aggiunge solo i dettagli (svolgimento, materiali). *Contro:* un elemento è diviso tra due moduli.
- **C.** Sono due cose separate: un evento in Agenda e un'attività possono esistere senza legame. *Contro:* l'utente rischia di inserire tutto due volte.

**G2 — Come si inserisce l'orario delle lezioni?** (A5)
- **A.** Orario settimanale ricorrente valido per un periodo (es. il quadrimestre), con eccezioni sulle singole lezioni (spostata, annullata).
- **B.** Solo lezioni singole, eventualmente ripetute a mano.
- **C.** Orario ricorrente per le superiori, lezioni per insegnamento con date di inizio e fine per università e AFAM.

**G3 — Che tipi di evento esistono in Agenda, oltre agli elementi di Attività?**
- Proposta da confermare: *Lezione*, *Appuntamento personale*, *Evento di classe/gruppo*.
- "Appuntamenti" (dec. 22) comprende anche impegni **non scolastici** (sport, visite mediche) o solo appuntamenti di studio (ricevimento, ripetizioni)?

**G4 — Inviti da gruppi con persone di istituti diversi** (A3)
- **A.** Un gruppo appartiene sempre a un istituto: solo chi ha quell'ambiente può partecipare. *Pro:* coerente con l'isolamento. *Contro:* niente gruppi tra scuole diverse.
- **B.** Chi accetta l'invito sceglie in quale dei suoi ambienti salvarlo. *Pro:* flessibile. *Contro:* l'evento esiste in un solo ambiente dell'invitato.
- **C.** I gruppi trasversali hanno un posto fuori dagli ambienti. *Contro:* in parte modifica le dec. 62 e 64.

**G5 — Come funziona la partecipazione** (dec. 24, A4)
- Gli **eventi ufficiali** di classe compaiono:
  - **A.** in automatico, senza bisogno di accettarli;
  - **B.** dopo che lo studente li accetta.
- Per gli **inviti**, quali risposte? Sì/No, oppure Sì/No/Forse?
- Il docente o l'organizzatore vede le risposte di ciascuno?

**G6 — Promemoria** (A2)
- **A.** Solo nel centro notifiche interno e nel blocco "Oggi" della Home, come dice la dec. 43.
- **B.** Rivedere la dec. 43 per i soli **promemoria locali** del telefono: niente server, niente email, nessun servizio di terze parti. *Pro:* l'Agenda diventa davvero utile. *Contro:* va cambiata una decisione confermata.

**G7 — Viste del calendario nell'MVP**
- Giorno, Settimana, Mese, Lista ("Prossimi"): quali servono subito? (Il prototipo ha già la striscia della settimana nella Home.)

**G8 — Calendario scolastico e festività** (A6)
- **A.** Le inserisce l'utente (periodi di vacanza).
- **B.** Festività nazionali già incluse; vacanze regionali aggiunte dall'utente.
- **C.** Calendari regionali caricati ogni anno dal team da fonti ufficiali, come per gli istituti.

**G9 — Presenze personali sulle lezioni** (A7)
- **A.** Esclusa: le card mostrano solo orario e dettagli.
- **B.** Lo studente può segnare per conto suo "presente/assente" (dato privato, mai visibile al docente). *Nota:* sarebbe una **funzione nuova**, non presente nel briefing.

**G10 — AI in Agenda** (A9)
- **A.** Si progetta nel modulo AI. Qui si lascia solo lo spazio nell'interfaccia.
- **B.** Si progettano già qui le azioni AI dell'Agenda (es. "pianifica lo studio per la verifica"), sempre con conferma.
