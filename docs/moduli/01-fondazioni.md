# Modulo 01 — Fondazioni di dominio e configurazione dell'ambiente

> Stato: **specifica v4 — modulo chiuso**. Si basa sul briefing (dec. 1–61) e sulle decisioni 62–88 (`docs/decisioni.md`).
> Legenda: ✅ confermato · 🔧 proposta da validare · ⏸ rinviato · ❓ domanda aperta (§8)

**Perché si parte da qui:** Agenda, Attività, Registro voti, Home, Classi e permessi dipendono tutti da *chi è l'utente*, *in quale ambiente si trova* e *quale percorso segue*.

---

## 0. Stato delle tensioni del primo giro

| # | Tensione | Esito |
|---|---|---|
| T1 | Integrazioni contro login, AI e store | ✅ Sono eccezioni ammesse (dec. 67) |
| T2 | Cos'è un ambiente | ✅ Spazio privato per scuola o facoltà (dec. 62) |
| T3 | Studente e docente nello stesso account | ✅ No, account separati (dec. 63) |
| T4 | Moduli disattivabili contro Home e barra fisse | ⏸ Rinviato (dec. 65) |
| T5 | Minorenni | ✅ Minimo 14 anni (dec. 66). Data di nascita chiesta alla registrazione, blocco prima di creare l'account (dec. 74) |
| T6 | Nome reale dei 14-17enni in Community | Resta aperta: si decide nel modulo Community |
| T7 | Docenti non verificati | Resta aperta: si decide nel modulo Classi. La TOTP obbligatoria (dec. 71) protegge l'account, ma non verifica l'identità |
| T8 | Istituti | ✅ Elenco preso da fonti online (dec. 76). Chi non trova l'istituto non prosegue. Conseguenze → §8 (Q1, Q2) |
| T9 | Periodo didattico | ✅ Rientra nella configurazione completa (dec. 69) |
| T10 | Stile visivo | Resta aperta (`DESIGN.md` §12) |

---

## 1. Confine del modulo e requisiti confermati

**Dentro:**
- Registrazione e accesso: email/password, Google e Apple (dec. 8).
- Verifica email obbligatoria (dec. 59).
- Soglia d'età di 14 anni (dec. 66).
- Scelta del ruolo, definitiva perché legata all'account (dec. 63).
- 2FA: codice via email per gli studenti, TOTP obbligatoria per i docenti (dec. 56, 71).
- Sessioni e dispositivi (dec. 56).
- Ambienti: creazione, cambio, modifica ed eliminazione (dec. 10, 62).
- Configurazione completa in onboarding: percorso, istituto dall'elenco interno, periodo didattico, materie o insegnamenti, moduli (dec. 8, 68, 69).
- Preferenze di lingua e tema (dec. 46, 48).
- Esportazione e cancellazione dei dati, solo come flusso (dec. 60).
- Privacy di default del profilo (dec. 15).
- **Importazione** nell'MVP (dec. 72): qui c'è solo il suo posto nel flusso; fonti e formati restano aperti → §8 Q3.

**Fuori:**
- Profilo social e Community.
- Collegamento a classi e docenti.
- Contenuti di Agenda, Attività e voti.
- Piani e pagamenti (dec. 42).
- Vista aggregata (eliminata con la dec. 64).
- Backend e schema tecnico (dec. 53).

**Requisiti chiave:**
- R1 — L'app è pienamente usabile da uno studente senza docente collegato (regola 8, dec. 13).
- R2 — Gli ambienti di uno stesso account sono **isolati**: dati e impostazioni non si mescolano (dec. 10), e nessuna schermata mostra più ambienti insieme (dec. 64).
- R3 — Senza email verificata ed età ≥ 14 dichiarata non si entra nell'app.
- R4 — Un account docente non entra nell'app senza aver configurato la TOTP.
- R5 — Ogni ambiente è legato a **un istituto** dell'elenco, sia per gli studenti sia per i docenti (dec. 62, 73, 76).

---

## 2. Utenti e responsabilità

| Attore | Cosa fa in questo modulo | Note |
|---|---|---|
| **Studente superiori** (14+) | Crea l'account e uno o più ambienti di tipo *Superiori*, configura classe, materie e periodo | Può essere minorenne (14-17): si applicano le protezioni per i minori (dec. 15, 61) |
| **Studente universitario** | Crea ambienti di tipo *Università* (corso, insegnamenti, CFU, sessioni) | Stesso tipo di account dello studente superiori (dec. 63) |
| **Studente con più ambienti** | Cambia scuola, si iscrive all'università, segue due corsi di studio | Un ambiente per scuola o facoltà (dec. 62) |
| **Docente** | Account separato, TOTP obbligatoria, un ambiente per ogni scuola (istituto e materie insegnate) | dec. 63, 71, 73 |
| **Team interno** 🔧 | Carica e aggiorna l'elenco degli istituti dalle fonti online (dec. 76), gestisce le sospensioni (dec. 66) | Ruoli e strumenti interni da definire nel modulo Moderazione (dec. 61) |

---

## 3. User journey essenziali

### J1 — Registrazione studente con email
1. Benvenuto → "Inizia".
2. Metodo di accesso → Email.
3. **Data di nascita** (dec. 74). Età < 14 → blocco, **nessun account creato** (J9).
4. Email e password → invio del **codice a 6 cifre** (dec. 78).
5. Verifica email → l'account viene creato.
6. **Dati personali**: nome e cognome.
7. **Ruolo**: Studente / Docente. Si può correggere fino alla fine dell'onboarding (dec. 81).
8. **Crea il primo ambiente** (= istituto, dec. 62):
   1. percorso (Superiori / Università);
   2. istituto dall'elenco (ricerca). Se manca → blocco (dec. 76);
   3. dettagli del percorso (§4);
   4. periodo didattico;
   5. materie o insegnamenti;
   6. **importazione** (dec. 72; posizione nel flusso e contenuto → Q3);
   7. moduli (contenuto ⏸ dec. 65).
9. Invito ad attivare la 2FA via email: facoltativa ma consigliata (dec. 79).
10. Riepilogo, dove il ruolo è ancora modificabile → "Entra": il ruolo diventa definitivo → Home dell'ambiente.

> 🔧 La data di nascita viene chiesta **prima** di email e password: così chi ha meno di 14 anni viene fermato senza che si crei un account o si raccolga la sua email (dec. 74).

### J2 — Registrazione con Google o Apple
Come J1, con queste differenze:
- Si salta la password.
- Nome e cognome sono precompilati se il provider li fornisce, altrimenti si inseriscono a mano.
- La data di nascita si chiede comunque, **prima** di collegare il provider (dec. 74).
- L'email del provider, anche quella nascosta di Apple, conta come verificata: si salta il codice (dec. 78).

### J3 — Registrazione docente
Come J1 fino al ruolo, poi:
1. **Configurazione TOTP obbligatoria**: QR code, inserimento del primo codice, **codici di recupero** da salvare (dec. 77).
2. Ambiente docente: istituto dall'elenco e materie insegnate. Per un'altra scuola si crea un altro ambiente (dec. 73).
3. Le classi si gestiscono nel modulo Classi.

### J4 — Nuovo ambiente (cambio scuola, iscrizione all'università)
Profilo → Ambienti → "Nuovo ambiente" → stessa configurazione del passo 7 di J1 → l'ambiente nuovo diventa quello attivo. Quello precedente resta disponibile e separato.

### J5 — Cambio ambiente
Tap sull'avatar o sul nome dell'ambiente nell'header della Home → sheet con l'elenco degli ambienti (nome, istituto, percorso) → selezione → l'app si ricarica sull'ambiente scelto. L'ultimo ambiente usato si riapre all'avvio 🔧.

### J6 — Passaggio d'anno nello stesso ambiente (es. da 4ª a 5ª)
A fine periodo l'app **propone** il passaggio all'anno successivo (es. "Passi alla 5ª?") e l'utente conferma, rimanda o modifica (dec. 75). Restano da definire, nel modulo voti, quando scatta la proposta e cosa succede a materie e storico dell'anno precedente 🔧.

### J7 — Accesso da un nuovo dispositivo
Credenziali → 2FA (codice via email per lo studente, se l'ha attivata (dec. 79); TOTP per il docente, oppure un codice di recupero (dec. 77)) → il dispositivo compare in Profilo → Sicurezza → Dispositivi, dove si può revocare.

### J8 — Eliminazione di un ambiente o dell'account
- **Ambiente**: conferma esplicita, proposta di esportare prima i dati, eliminazione. L'eliminazione dell'ultimo ambiente è ⏸ (dec. 80).
- **Account**: Profilo → Dati → Esporta / Elimina account → conferma e verifica (2FA) → eliminazione (tempi e eventuale periodo di ripensamento ⏸).

### J9 — Utente sotto i 14 anni (dec. 66)
- **Alla registrazione**: data di nascita < 14 anni → schermata di blocco, **l'account non viene creato** (dec. 74). Va deciso se impedire un nuovo tentativo con un'altra data → §8 Q4.
- **Dopo**: se emerge in seguito (es. segnalazione) → il team sospende l'account (processo nel modulo Moderazione).

### Casi limite
- Email mai verificata: l'utente resta sulla schermata "Controlla la tua email", con "Reinvia" e "Cambia email".
- Onboarding interrotto (app chiusa a metà): alla riapertura si riprende dal passo in cui ci si era fermati 🔧.
- Offline durante la registrazione o l'onboarding: non si può procedere, compare un messaggio chiaro (offline solo in lettura, dec. 54).
- Istituto non presente nell'elenco → l'utente non può proseguire (dec. 76). Cosa vede e cosa può fare → §8 Q2.
- Ruolo scelto per errore: si corregge fino alla fine dell'onboarding, dopo serve un nuovo account (dec. 63, 81).
- Data di nascita da modificare dopo la registrazione → solo tramite assistenza (dec. 88).
- Docente che perde l'app autenticatore → codice di recupero (dec. 77). Se perde anche i codici → §8 Q5.
- Due ambienti con lo stesso istituto (es. due corsi di laurea nello stesso ateneo): consentito 🔧, distinti dal corso di studio.

---

## 4. Inventario concettuale dei dati (nessun database scelto)

| Entità | Campi concettuali | Appartiene a | Note |
|---|---|---|---|
| **Account** | email, email verificata, nome, cognome, data di nascita (dec. 74), ruolo (studente/docente, immutabile), stato (attivo/sospeso/in cancellazione), lingua, tema | utente | Ruolo immutabile (dec. 63) |
| **Metodo di accesso** | tipo (password/Google/Apple), identificativo presso il provider | Account | Più metodi sullo stesso account? 🔧 |
| **Sicurezza** | tipo di 2FA (email/TOTP), stato, codici di recupero monouso | Account | TOTP obbligatoria per i docenti (dec. 71); 2FA facoltativa per gli studenti (dec. 79); codici di recupero (dec. 77) |
| **Sessione / Dispositivo** | nome, piattaforma, ultimo accesso, revocata | Account | dec. 56 |
| **Ambiente** | nome (predefinito: nome dell'istituto), tipo (Superiori/Università/Docente), istituto, contesto, periodo corrente, configurazione moduli, data di creazione, ultimo utilizzo | Account | Isolato (R2) |
| **Istituto** (elenco) | nome, tipo (scuola superiore/ateneo), comune, provincia, codice ufficiale 🔧, indirizzi o corsi offerti 🔧, fonte e data di aggiornamento | Team interno | Preso da fonti online (dec. 76). Quali fonti → §8 Q1 |
| **Importazione** 🔧 | origine, contenuto importato, data, esito | Ambiente | dec. 72; contenuto → §8 Q3 |
| **Contesto Superiori** | indirizzo di studio, anno (1–5), sezione 🔧 | Ambiente | — |
| **Contesto Università** | corso di studio, tipo (triennale/magistrale/ciclo unico) 🔧, anno, CFU totali previsti 🔧 | Ambiente | — |
| **Periodo didattico** | anno scolastico/accademico, suddivisione (trimestri/quadrimestri oppure semestri/sessioni), date di inizio e fine | Ambiente | Serve ad Agenda e voti |
| **Materia / Insegnamento** | nome, docente (testo libero 🔧), per l'università: CFU e semestre | Ambiente | Colore per materia: aperto (`DESIGN.md` §12) |
| **Configurazione moduli** | moduli attivi | Ambiente 🔧 | Contenuto ⏸ (dec. 65). Per ambiente perché "impostazioni separate" (dec. 10) |
| **Consensi** | documento (privacy, termini), versione, data | Account | Testi legali da redigere |

---

## 5. Mappa delle schermate (mobile-first)

**Stack di onboarding** (prima delle tab, senza barra inferiore):

| ID | Schermata | Contenuto principale |
|---|---|---|
| ON-01 | Benvenuto | Hero, claim, "Inizia", "Ho già un account" |
| ON-02 | Data di nascita | Selettore data, nota sull'uso del dato (dec. 74) |
| ON-03 | Blocco età | Messaggio < 14 anni, nessun account creato, nessuna azione possibile |
| ON-04 | Metodo di accesso | Apple, Google, Email (ordine 🔧) |
| ON-05 | Email e password | Campi, requisiti della password, consensi |
| ON-06 | Verifica email | Codice a 6 cifre (dec. 78), reinvio, cambio email. Saltata con Google o Apple |
| ON-07 | Dati personali | Nome, cognome |
| ON-08 | Ruolo | Studente / Docente, nota "modificabile fino alla fine della configurazione" (dec. 81) |
| ON-09 | Configura TOTP (solo docenti) | QR code, codice di verifica, codici di recupero da salvare (dec. 77) |
| ON-10 | Percorso | Superiori / Università (per i docenti: materie insegnate) |
| ON-11 | Istituto | Ricerca nell'elenco; se non c'è → ON-11b |
| ON-11b | Istituto non trovato | Blocco (dec. 76) più modulo "Segnala il tuo istituto" (nome, comune, tipo) inviato al team (dec. 82) |
| ON-12 | Dettagli percorso | Superiori: indirizzo, anno, sezione. Università: corso, tipo, anno |
| ON-13 | Periodo didattico | Anno, suddivisione, date |
| ON-14 | Materie / Insegnamenti | Lista modificabile (ci sono suggerimenti in base all'indirizzo? 🔧) |
| ON-15 | Importa | Segnaposto: l'importazione è nell'MVP (dec. 72) ma il contenuto è rinviato (dec. 83) |
| ON-16 | Moduli | Interruttori (elenco ⏸ dec. 65) |
| ON-17 | Proteggi l'account (solo studenti) | Invito ad attivare la 2FA via email, "Più tardi" (dec. 79) |
| ON-18 | Riepilogo | Tutto modificabile, ruolo compreso; "Entra" rende il ruolo definitivo |
| ON-19 | Accesso | Email/password, Apple, Google, password dimenticata |
| ON-20 | Verifica 2FA | Codice via email (studente) o TOTP (docente), "Usa un codice di recupero" |

**Dentro l'app:**
- Header della Home → **selettore ambienti** (sheet): elenco degli ambienti e "Nuovo ambiente".
  - ⚠️ Nel prototipo l'avatar apre il menu: andrà riassegnato al selettore e il menu spostato su un'icona dedicata 🔧.
- **Profilo** (voce della barra, dec. 19) → *Il mio account*, *Ambienti*, *Sicurezza* (2FA, dispositivi, password), *Preferenze* (lingua, tema), *Privacy e dati* (esporta, elimina).
- **Ambienti → dettaglio ambiente**: dati del percorso, periodo, materie, moduli, "Elimina ambiente".

---

## 6. Stati

| Schermata | Vuoto | Caricamento | Errore | Offline | Privacy |
|---|---|---|---|---|---|
| ON-05/19 Accesso | — | Bottone in caricamento | Credenziali errate, email già usata, password debole | "Serve una connessione per accedere" | I testi dei consensi sono sempre visibili |
| ON-02 Data di nascita | — | — | Data non valida o nel futuro | Come sopra | Nota: "La data di nascita serve a verificare l'età minima" 🔧 |
| ON-06 Verifica | — | Invio in corso | Codice errato o scaduto, troppi tentativi | Come sopra | — |
| ON-07 Dati personali | — | — | Campi obbligatori mancanti | Come sopra | — |
| ON-11 Istituto | Nessun risultato → ON-11b | Ricerca in corso | Errore di caricamento dell'elenco + "Riprova" | Come sopra | — |
| ON-14 Materie | "Aggiungi la tua prima materia" | — | Nome duplicato | Come sopra | — |
| Selettore ambienti | Impossibile finché c'è almeno un ambiente (dec. 80 ⏸) | Skeleton | Cambio ambiente non riuscito | Si possono aprire solo gli ambienti già scaricati (dec. 54) 🔧 | Badge "Privato" |
| Sicurezza → Dispositivi | Solo il dispositivo corrente | Skeleton | Revoca non riuscita | Sola lettura | — |
| Privacy e dati | — | Esportazione in preparazione | Esportazione non riuscita | Non disponibile | Conferme forti per l'eliminazione |

---

## 7. Dipendenze

| Modulo | Cosa riceve da Fondazioni |
|---|---|
| **Home** | Ambiente attivo, nome per il saluto, tipo di percorso (adatta i contenuti, dec. 21), moduli attivi |
| **Agenda** | Periodo didattico, materie/insegnamenti, ambiente attivo |
| **Attività** | Tipo di percorso (verifiche e interrogazioni oppure esami e appelli), materie |
| **Registro voti** | Periodo e suddivisione (medie per periodo), materie e CFU, isolamento dei voti dal docente (dec. 36) |
| **Classi / Docenti** | Ruolo dell'account, istituto dall'elenco interno (per trovare classi e docenti), età (protezione dei minori) |
| **Community / Messaggi** | Nome e cognome, età (14-17 → protezioni), privacy di default |
| **AI** | Ambiente attivo come confine del contesto autorizzato (dec. 39) |
| **Impostazioni / Moderazione** | Stato dell'account (sospeso), sessioni, esportazione ed eliminazione |

**Da cosa dipende Fondazioni:** elenco degli istituti dalle fonti online (dati e processo di aggiornamento), definizione dell'importazione, testi legali (privacy, termini, consensi), scelta del backend (dec. 53).

---

## 8. Decisioni aperte

| # | Tema | Stato |
|---|---|---|
| Q1 | Fonti dell'elenco istituti | ✅ Confermate (dec. 86), vedi sotto. AFAM nel perimetro (dec. 87) |
| Q2 | Istituto non trovato | ✅ Blocco più modulo "Segnala il tuo istituto" (dec. 82) |
| Q3 | Importazione | ⏸ Rinviata (dec. 83). La schermata ON-15 resta come segnaposto |
| Q4 | Protezioni dopo il blocco età | ✅ Nessuna (dec. 84). La data di nascita si modifica solo tramite assistenza (dec. 88) |
| Q5 | Codici di recupero persi | ✅ Tramite assistenza, processo rinviato (dec. 85) |

### Q1 — Fonti confermate (dec. 86)

| Percorso | Fonte | Cosa contiene | Formato e licenza |
|---|---|---|---|
| **Superiori** | **Portale Unico dei Dati della Scuola**, Ministero dell'Istruzione e del Merito (`dati.istruzione.it/opendata`, sezione "Scuole") | Anagrafica delle scuole **statali** e **paritarie**: codice meccanografico, denominazione, indirizzo, comune, provincia, tipo di istituto. Aggiornata per anno scolastico | CSV, licenza **IODL 2.0** (riuso consentito anche commerciale, citando la fonte) |
| **Università (atenei)** | **USTAT – Open data del Ministero dell'Università e della Ricerca** (`dati-ustat.mur.gov.it`), dataset "Atenei" e tabella dei codici `cod_atenei.csv` | Elenco degli atenei con codice, nome e caratteristiche | CSV. Licenza da verificare sul portale |
| **Università (corsi)** | USTAT, dataset "Offerta formativa" | Corsi di laurea dall'a.a. 2010/2011 | CSV. Licenza e copertura degli ultimi anni da verificare |
| **AFAM** (dec. 87) | USTAT, file "AFAM Istituti Codifiche" (`AFAM_ISTITUTI-CODIFICHE.csv`) | Codice, tipo di istituto, regione, provincia, sito web, stato di attività (conservatori, accademie, ISIA) | CSV, pubblico dominio secondo il portale. Corsi AFAM e aggiornamento da verificare |

**Uso consigliato:** il team scarica i file a ogni anno scolastico o accademico e li carica in un elenco interno all'app (opzione A del giro precedente). L'app **non** consulta i portali mentre è in uso, quindi non serve nessuna integrazione esterna (coerente con la dec. 58). Le segnalazioni del modulo "Segnala il tuo istituto" (dec. 82) servono a correggere i dati mancanti.

**Da verificare prima di adottarle:**
- Che nei file del Ministero ci siano anche le scuole delle province autonome di Trento e Bolzano e della Valle d'Aosta, che hanno sistemi scolastici propri.
- La licenza dei dati USTAT e il loro aggiornamento: alcuni dataset si fermano ad anni passati.
- Per le AFAM: struttura dei percorsi (diplomi accademici di I e II livello, CFA invece di CFU) da gestire nel contesto Università 🔧.
- La citazione della fonte richiesta dalla licenza IODL 2.0: dove mostrarla nell'app (es. Profilo → Informazioni).

---

## 9. Priorità

**MVP** (tutto confermato dal briefing o dalle dec. 62–81):
- Richiesta della data di nascita e blocco sotto i 14 anni, prima di creare l'account.
- Registrazione e accesso con email/password, Google e Apple; verifica dell'email con codice a 6 cifre.
- Ruolo legato all'account, correggibile fino alla fine dell'onboarding.
- Elenco istituti (superiori, atenei, AFAM) caricato una volta all'anno dalle fonti ufficiali, con modulo "Segnala il tuo istituto".
- 2FA: app autenticatore obbligatoria per i docenti, codice via email facoltativo per gli studenti, codici di recupero per entrambi.
- Onboarding con configurazione completa: percorso, istituto dall'elenco, dettagli, periodo, materie, importazione, moduli.
- Un ambiente per istituto, sia per studenti sia per docenti: creazione, cambio, eliminazione (tranne l'ultimo ⏸), passaggio d'anno proposto con conferma.
- Profilo: account, sicurezza (dispositivi collegati e revoca), lingua e tema, esportazione ed eliminazione dei dati (dec. 60).

**Rinviati:** contenuto dell'importazione (dec. 83), moduli disattivabili (dec. 65), processo di assistenza (dec. 85).

**Fasi successive:** nessuna nuova funzione proposta. Restano escluse la vista aggregata (dec. 64) e le integrazioni funzionali (dec. 58).
