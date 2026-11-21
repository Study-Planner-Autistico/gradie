# Modulo 01 — Fondazioni di dominio e configurazione dell'ambiente

> Stato: **apertura del modulo** (vincoli, tensioni, piano, domande). Nessuna decisione nuova è stata presa qui.
> Legenda: ✅ confermato dal briefing · 🔧 da progettare · ⏸ rinviato · 💡 possibile evoluzione · ❓ domanda aperta

**Perché si parte da qui:** Agenda, Attività, Registro voti, Home, Classi e permessi si appoggiano tutti su *chi è l'utente*, *in quale ambiente si trova* e *quale percorso segue* (superiori o università). Se non si definiscono prima questi concetti, ogni modulo successivo dovrebbe inventarli da sé.

---

## 1. Vincoli recepiti (✅)

**Mercato e utenti**
- Superiori e università italiane; niente scuole medie. Lancio in Italia, interfaccia in italiano e inglese (dec. 2, 7, 46).
- Due tipi di utente, studente e docente; nessun profilo genitore (dec. 11).
- Nome e cognome obbligatori, nessun nickname come identità (dec. 16).

**Account e sicurezza**
- Accesso con email/password, Google Sign-In e Apple Sign-In; verifica email obbligatoria (dec. 8, 59).
- Nessuna verifica dell'iscrizione a scuola o università: chiunque può registrarsi (dec. 59).
- 2FA, gestione delle sessioni e dei dispositivi collegati (dec. 56).
- L'utente può consultare, modificare, esportare e cancellare tutti i suoi dati (dec. 60).

**Ambienti e percorso**
- Un account può contenere **più ambienti indipendenti**, con dati e impostazioni separati e la possibilità di passare dall'uno all'altro. Una vista aggregata è *desiderata* (dec. 10).
- Esperienza diversa per superiori (classi, materie, professori, verifiche, interrogazioni, voti) e università (corsi, insegnamenti, CFU, appelli, sessioni, carriera) (dec. 2, 7).
- Moduli attivabili e disattivabili (dec. 3). La Home invece ha sezioni fisse e contenuti adattati (dec. 20, 21). La barra inferiore ha 5 voci fisse (dec. 19).
- Onboarding guidato e personalizzato: scelta del percorso, scelta dei moduli e, *se previsto in seguito*, importazione (dec. 8).

**Principi trasversali**
- L'app deve restare utile anche senza un docente collegato; il collegamento è facoltativo (dec. 13, regola 8).
- Contenuti personali privati per default, con protezione specifica per i minorenni (dec. 15, 61).
- Nessuna integrazione di terze parti (dec. 58). Notifiche solo nel centro notifiche interno (dec. 43). Niente gamification (dec. 57).
- Tecnologia: React Native + Expo, prima l'app mobile (dec. 51, 52). Backend ⏸ (dec. 53). Offline solo in consultazione (dec. 54).

---

## 2. Ambiguità e tensioni reali

| # | Tensione | Perché conta per questo modulo |
|---|---|---|
| T1 | **Integrazioni.** La dec. 58 esclude le terze parti, ma la dec. 8 prevede Google/Apple Sign-In (che sono provider esterni). Anche l'AI a pagamento (dec. 38, 41) richiederà probabilmente un provider di modelli e acquisti tramite App Store/Play Store. Siri e assistenti (dec. 23) restano solo spunti. | Bisogna sapere se login, AI e pagamenti tramite store sono **eccezioni ammesse** o se la dec. 58 va riformulata. |
| T2 | **Cos'è un "ambiente"?** La dec. 10 non dice se corrisponde a un percorso (es. "Liceo" e "Laurea"), a un anno scolastico o a un contenitore libero. | Definisce la struttura di tutti i dati: Agenda, voti e materie vivono *dentro* un ambiente. |
| T3 | **Studente e docente nello stesso account?** Le dec. 10-12 non chiariscono se un account può avere sia ambienti da studente sia ambienti da docente (es. un universitario che dà ripetizioni, o un docente che studia). | Cambia l'onboarding, i permessi e il selettore degli ambienti. |
| T4 | **Moduli disattivabili contro struttura fissa.** I moduli si possono spegnere (dec. 3), ma la Home ha blocchi fissi (dec. 21) e la barra ha 5 voci fisse (dec. 19). | Cosa succede se si disattiva il Registro voti (blocco "Andamento") o la Community (voce della barra)? |
| T5 | **Minorenni senza età né genitori.** Si chiede protezione dei minori (dec. 15, 61), ma non si verifica nulla (dec. 59) e non esiste il profilo genitore (dec. 11). In Italia il consenso digitale autonomo parte dai 14 anni (GDPR art. 8 e D.lgs. 101/2018). **Va verificato con un legale.** | Determina se e come chiedere l'età in registrazione e cosa fare con chi ha meno di 14 anni. |
| T6 | **Nome e cognome reali contro privacy dei minori.** Il nome reale è obbligatorio (dec. 16) e i profili social lo mostrano (dec. 33). | Va deciso il default di visibilità per i minorenni (dettaglio del modulo Community, ma il dato nasce qui). |
| T7 | **Docenti non verificati.** Chiunque può dichiararsi docente (dec. 59) e i docenti vedono dati delle classi, anche di minorenni (dec. 37). | Rischio per la privacy e per la tutela dei minori: va almeno annotato. Il dettaglio spetta al modulo Classi. |
| T8 | **Dati di riferimento esterni.** Un elenco di scuole, atenei e corsi di laurea richiederebbe dati esterni o importazioni, in tensione con la dec. 58 e con l'importazione ⏸. | Decide se l'istituto è testo libero o un elenco interno. |
| T9 | **Periodo didattico.** Anno scolastico/accademico, trimestri/quadrimestri e sessioni non sono citati come dato di configurazione. | Agenda e voti (medie per periodo) ne avranno bisogno. Va chiarito se lo si chiede in onboarding. |
| T10 | **Stile visivo.** La dec. 50 chiede uno stile minimal tipo Notion/Linear, mentre l'immagine di riferimento è molto colorata (vedi `DESIGN.md` §1). | Non blocca il modulo, ma resta aperta. |

---

## 3. Piano del modulo

### 3.1 Confine
**Dentro:** ciclo di vita dell'account (registrazione, verifica email, accesso, 2FA, sessioni e dispositivi, cancellazione ed esportazione *a livello di flusso*), creazione, modifica, cambio ed eliminazione degli ambienti, scelta del percorso e della struttura minima (materie o insegnamenti), attivazione dei moduli, onboarding, preferenze base (lingua, tema), default di privacy del profilo.

**Fuori (moduli successivi):** profilo social e feed (Community), collegamento a docenti e classi (Classi/Gruppi), contenuti di Agenda, Attività e voti, piani e pagamenti (⏸), importazione (⏸), backend e schema tecnico (⏸).

### 3.2 Cosa produrrò, nell'ordine del briefing (dopo le risposte §4)
1. **Confine e requisiti confermati**: la tabella sopra, rifinita.
2. **Utenti e responsabilità**: studente superiori, studente universitario, docente; casi misti secondo la risposta a T3.
3. **User journey e casi limite**: prima registrazione, accesso con Apple e email nascosta, verifica email mai completata, secondo ambiente, cambio ambiente, passaggio dalle superiori all'università, eliminazione di un ambiente, eliminazione dell'account, perdita del secondo fattore 2FA, accesso da un nuovo dispositivo, utente sotto la soglia d'età.
4. **Inventario concettuale dei dati** (senza database). Entità candidate, tutte 🔧 da confermare: *Account, Metodo di accesso, Sessione/Dispositivo, Ambiente, Percorso (superiori o università), Contesto del percorso, Materia/Insegnamento, Periodo didattico, Configurazione moduli, Preferenze, Consensi*.
5. **Mappa delle schermate mobile-first**. Bozza: Benvenuto → Metodo di accesso → Verifica email → Nome e cognome (più età, se T5) → Ruolo → Percorso → Dettagli percorso → Materie → Moduli → Riepilogo → Home. Poi: selettore ambienti (dall'avatar nell'header), Profilo → Ambienti, Profilo → Sicurezza (2FA, sessioni), Profilo → Dati (esporta ed elimina).
6. **Stati**: vuoto, errore, caricamento, offline (per esempio la registrazione è impossibile offline) e privacy per ogni schermata.
7. **Dipendenze**: cosa fornisce questo modulo ad Agenda, Attività, Voti, Home, Classi e Community.
8. **Decisioni aperte** residue, in forma di domande brevi.
9. **Priorità MVP e fasi successive**, senza aggiungere funzioni nuove.

---

## 4. Domande necessarie per completare il modulo

> Per ogni domanda: alternative e trade-off. Dove indico una preferenza è solo un suggerimento: decidi tu.

**D1 — Cos'è un ambiente?** (T2)
- **A.** Un percorso di studio (es. "Liceo Scientifico", "Laurea in Economia"). Dura più anni e contiene i suoi anni o periodi. *Pro:* naturale e stabile, lo storico dei voti resta unito. *Contro:* serve gestire il passaggio d'anno.
- **B.** Un anno scolastico o accademico. *Pro:* ogni anno parte pulito. *Contro:* lo storico si frammenta e la carriera universitaria (CFU) si spezza.
- **C.** Un contenitore libero (anche "Corso di inglese" o "Preparazione test"). *Pro:* flessibile. *Contro:* le esperienze da superiori o università diventano meno guidate.

**D2 — Studente e docente nello stesso account?** (T3)
- **A.** Sì: ogni ambiente ha un tipo (studente o docente). *Pro:* copre i casi misti. *Contro:* l'interfaccia cambia molto tra un ambiente e l'altro.
- **B.** No: il ruolo si sceglie una volta per account. *Pro:* più semplice e sicuro. *Contro:* chi ha entrambi i ruoli deve usare due account.

**D3 — Vista aggregata nell'MVP?** (dec. 10, "desiderata")
- **A.** Sì, almeno per Agenda e Home ("tutti gli ambienti"). *Contro:* più complessità su privacy e filtri.
- **B.** No, nell'MVP si passa da un ambiente all'altro; la vista aggregata arriva in una fase successiva.

**D4 — Quali moduli si possono disattivare?** (T4)
- **A.** Solo quelli della sidebar (Materiali, Appunti, Registro voti, Messaggi, ecc.). Le 5 voci della barra restano sempre, e i blocchi Home dei moduli spenti mostrano uno stato "modulo disattivato". *Coerente con le dec. 19 e 21.*
- **B.** Anche Community e altre voci della barra: richiederebbe di **modificare la dec. 19**.
- **C.** Nessun blocco Home sparisce mai; un modulo spento nasconde solo la sua pagina.

**D5 — Età e minori** (T5, da verificare con un legale)
- **A.** Data di nascita obbligatoria in registrazione. *Pro:* protezioni precise (soglie 14/18). *Contro:* dato personale in più da trattare.
- **B.** Solo una fascia d'età dichiarata (<14 / 14-17 / 18+). *Pro:* minimizzazione dei dati. *Contro:* meno precisa.
- **C.** Nessuna domanda: si considera possibile minorenne chiunque scelga le superiori. *Contro:* protegge poco i più giovani e penalizza i maggiorenni.
- E inoltre: cosa fare con chi ha **meno di 14 anni**? Bloccare la registrazione, limitare le funzioni (es. niente Community) o altro?

**D6 — Eccezioni alla dec. 58** (T1)
- **A.** Login Google/Apple, provider AI e acquisti tramite App Store/Play Store sono eccezioni ammesse. La dec. 58 vale per le integrazioni *funzionali* (calendari, registri elettronici, Siri…).
- **B.** Rivedere la dec. 58 in modo esplicito.

**D7 — Istituto e corso: testo libero o elenco?** (T8)
- **A.** Testo libero (nome scuola o ateneo, indirizzo o corso). *Pro:* nessun dato esterno. *Contro:* difficile ritrovare compagni e classi in seguito.
- **B.** Elenco interno curato dal team. *Pro:* dati puliti. *Contro:* costo di manutenzione e possibile conflitto con la dec. 58 se derivato da fonti ministeriali.
- **C.** Non chiederlo nell'MVP.

**D8 — Quanto chiedere in onboarding?**
- **A.** Minimo obbligatorio (ruolo e percorso), tutto il resto saltabile e completabile dopo. *Pro:* si entra subito nell'app.
- **B.** Configurazione completa (materie o insegnamenti, periodo didattico, moduli). *Pro:* la Home è subito piena. *Contro:* più abbandoni.
- E inoltre: il **periodo didattico** (trimestre/quadrimestre, semestri/sessioni) va chiesto qui? (T9)

**D9 — Importazione in onboarding** (⏸)
- **A.** Esclusa dall'MVP: l'onboarding si limita all'inserimento manuale.
- **B.** Tenere nel layout un passaggio "Importa" disattivato, da progettare in seguito.

**D10 — Metodo 2FA** (dec. 56)
- **A.** App autenticatore (TOTP). *Pro:* standard e senza costi di invio. *Contro:* meno familiare per i più giovani.
- **B.** Codice via email. *Pro:* semplice. *Contro:* meno sicuro, e richiede di chiarire che le email transazionali (verifica, 2FA) sono diverse dalle notifiche escluse dalla dec. 43.
- **C.** Entrambi.
- E inoltre: la 2FA è facoltativa o obbligatoria (per esempio obbligatoria per i docenti)?
