# Modulo 01 — Fondazioni di dominio e configurazione dell'ambiente

> Stato: **specifica v1**. Si basa sul briefing (dec. 1–61) e sulle decisioni 62–71 (`docs/decisioni.md`).
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
| T5 | Minorenni | ✅ Minimo 14 anni, altrimenti sospensione (dec. 66). Come rilevare l'età → ❓ N3 |
| T6 | Nome reale dei 14-17enni in Community | Resta aperta: si decide nel modulo Community |
| T7 | Docenti non verificati | Resta aperta: si decide nel modulo Classi. La TOTP obbligatoria (dec. 71) protegge l'account, ma non verifica l'identità |
| T8 | Istituti | ✅ Elenco interno (dec. 68). Istituto mancante → ❓ N5 |
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

**Fuori:**
- Profilo social e Community.
- Collegamento a classi e docenti.
- Contenuti di Agenda, Attività e voti.
- Piani e pagamenti (dec. 42).
- Importazione (in attesa di ❓ N1).
- Vista aggregata (eliminata con la dec. 64).
- Backend e schema tecnico (dec. 53).

**Requisiti chiave:**
- R1 — L'app è pienamente usabile da uno studente senza docente collegato (regola 8, dec. 13).
- R2 — Gli ambienti di uno stesso account sono **isolati**: dati e impostazioni non si mescolano (dec. 10), e nessuna schermata mostra più ambienti insieme (dec. 64).
- R3 — Senza email verificata ed età ≥ 14 dichiarata non si entra nell'app.
- R4 — Un account docente non entra nell'app senza aver configurato la TOTP.

---

## 2. Utenti e responsabilità

| Attore | Cosa fa in questo modulo | Note |
|---|---|---|
| **Studente superiori** (14+) | Crea l'account e uno o più ambienti di tipo *Superiori*, configura classe, materie e periodo | Può essere minorenne (14-17): si applicano le protezioni per i minori (dec. 15, 61) |
| **Studente universitario** | Crea ambienti di tipo *Università* (corso, insegnamenti, CFU, sessioni) | Stesso tipo di account dello studente superiori (dec. 63) |
| **Studente con più ambienti** | Cambia scuola, si iscrive all'università, segue due corsi di studio | Un ambiente per scuola o facoltà (dec. 62) |
| **Docente** | Account separato, TOTP obbligatoria, ambiente docente (istituto e materie insegnate) | Più ambienti docente (es. due scuole)? → ❓ N2 |
| **Team interno** 🔧 | Mantiene l'elenco interno di istituti e corsi (dec. 68), gestisce le sospensioni (dec. 66) | Ruoli e strumenti interni da definire nel modulo Moderazione (dec. 61) |

---

## 3. User journey essenziali

### J1 — Registrazione studente con email
1. Benvenuto → "Inizia".
2. Metodo di accesso → Email.
3. Email e password → invio del codice o link di verifica (❓ N7).
4. Verifica email.
5. **Dati personali**: nome, cognome e data di nascita (🔧, vedi N3).
   - Età < 14 → blocco (J9).
6. **Ruolo**: Studente / Docente, con l'avviso che la scelta è definitiva per questo account.
7. **Crea il primo ambiente**:
   1. percorso (Superiori / Università);
   2. istituto dall'elenco (ricerca);
   3. dettagli del percorso (§4);
   4. periodo didattico;
   5. materie o insegnamenti;
   6. moduli (contenuto ⏸ dec. 65).
8. Riepilogo → "Entra" → Home dell'ambiente.

### J2 — Registrazione con Google o Apple
Come J1, con queste differenze:
- Si salta la password.
- Nome e cognome sono precompilati se il provider li fornisce, altrimenti si inseriscono a mano.
- La data di nascita va chiesta comunque.
- Apple può fornire un'**email nascosta** (relay): ❓ N7, se basta come email verificata.

### J3 — Registrazione docente
Come J1 fino al ruolo, poi:
1. **Configurazione TOTP obbligatoria**: QR code, inserimento del primo codice, codici di recupero (❓ N6).
2. Ambiente docente: istituto dall'elenco e materie insegnate.
3. Le classi si gestiscono nel modulo Classi.

### J4 — Nuovo ambiente (cambio scuola, iscrizione all'università)
Profilo → Ambienti → "Nuovo ambiente" → stessa configurazione del passo 7 di J1 → l'ambiente nuovo diventa quello attivo. Quello precedente resta disponibile e separato.

### J5 — Cambio ambiente
Tap sull'avatar o sul nome dell'ambiente nell'header della Home → sheet con l'elenco degli ambienti (nome, istituto, percorso) → selezione → l'app si ricarica sull'ambiente scelto. L'ultimo ambiente usato si riapre all'avvio 🔧.

### J6 — Passaggio d'anno nello stesso ambiente (es. da 4ª a 5ª)
L'anno scolastico o accademico finisce, ma l'ambiente resta lo stesso. Come avanzare anno e periodo → ❓ N4.

### J7 — Accesso da un nuovo dispositivo
Credenziali → 2FA (codice via email per lo studente, se attivo ❓ N8; TOTP per il docente) → il dispositivo compare in Profilo → Sicurezza → Dispositivi, dove si può revocare.

### J8 — Eliminazione di un ambiente o dell'account
- **Ambiente**: conferma esplicita, proposta di esportare prima i dati, eliminazione. Si può eliminare l'ultimo ambiente? → ❓ N9.
- **Account**: Profilo → Dati → Esporta / Elimina account → conferma e verifica (2FA) → eliminazione (tempi e eventuale periodo di ripensamento ⏸).

### J9 — Utente sotto i 14 anni (dec. 66)
- **Alla registrazione**: data di nascita < 14 anni → schermata di blocco, l'account non viene creato o resta sospeso (❓ N3).
- **Dopo**: se emerge in seguito (es. segnalazione) → il team sospende l'account (processo nel modulo Moderazione).

### Casi limite
- Email mai verificata: l'utente resta sulla schermata "Controlla la tua email", con "Reinvia" e "Cambia email".
- Onboarding interrotto (app chiusa a metà): alla riapertura si riprende dal passo in cui ci si era fermati 🔧.
- Offline durante la registrazione o l'onboarding: non si può procedere, compare un messaggio chiaro (offline solo in lettura, dec. 54).
- Istituto non presente nell'elenco → ❓ N5.
- Ruolo scelto per errore: serve un nuovo account (dec. 63). Va chiarito se si può correggere prima di completare l'onboarding → ❓ N10.
- Data di nascita modificata dopo la registrazione → ❓ N3.
- Docente che perde l'app autenticatore → codici di recupero (❓ N6).
- Due ambienti con lo stesso istituto (es. due corsi di laurea nello stesso ateneo): consentito 🔧, distinti dal corso di studio.

---

## 4. Inventario concettuale dei dati (nessun database scelto)

| Entità | Campi concettuali | Appartiene a | Note |
|---|---|---|---|
| **Account** | email, email verificata, nome, cognome, data di nascita (🔧 N3), ruolo (studente/docente, immutabile), stato (attivo/sospeso/in cancellazione), lingua, tema | utente | Ruolo immutabile (dec. 63) |
| **Metodo di accesso** | tipo (password/Google/Apple), identificativo presso il provider | Account | Più metodi sullo stesso account? 🔧 |
| **Sicurezza** | tipo di 2FA (email/TOTP), stato, codici di recupero (❓ N6) | Account | TOTP obbligatoria per i docenti (dec. 71) |
| **Sessione / Dispositivo** | nome, piattaforma, ultimo accesso, revocata | Account | dec. 56 |
| **Ambiente** | nome (predefinito: nome dell'istituto), tipo (Superiori/Università/Docente), istituto, contesto, periodo corrente, configurazione moduli, data di creazione, ultimo utilizzo | Account | Isolato (R2) |
| **Istituto** (elenco interno) | nome, tipo (scuola superiore/ateneo), comune, provincia, indirizzi o corsi offerti 🔧 | Team interno | dec. 68. Contenuto e fonte → ❓ N5 |
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
| ON-02 | Metodo di accesso | Apple, Google, Email (ordine 🔧) |
| ON-03 | Email e password | Campi, requisiti della password, consensi |
| ON-04 | Verifica email | Codice o link (❓ N7), reinvio, cambio email |
| ON-05 | Dati personali | Nome, cognome, data di nascita |
| ON-06 | Blocco età | Messaggio < 14 anni, nessuna azione possibile |
| ON-07 | Ruolo | Studente / Docente, avviso "definitivo" |
| ON-08 | Configura TOTP (solo docenti) | QR code, codice di verifica, codici di recupero |
| ON-09 | Percorso | Superiori / Università (per i docenti: istituto e materie) |
| ON-10 | Istituto | Ricerca nell'elenco interno, istituto mancante (❓ N5) |
| ON-11 | Dettagli percorso | Superiori: indirizzo, anno, sezione. Università: corso, tipo, anno |
| ON-12 | Periodo didattico | Anno, suddivisione, date |
| ON-13 | Materie / Insegnamenti | Lista modificabile (ci sono suggerimenti in base all'indirizzo? 🔧) |
| ON-14 | Moduli | Interruttori (elenco ⏸ dec. 65) |
| ON-15 | Riepilogo | Tutto modificabile, "Entra" |
| ON-16 | Accesso | Email/password, Apple, Google, password dimenticata |
| ON-17 | Verifica 2FA | Codice via email (studente) o TOTP (docente) |

**Dentro l'app:**
- Header della Home → **selettore ambienti** (sheet): elenco degli ambienti e "Nuovo ambiente".
  - ⚠️ Nel prototipo l'avatar apre il menu: andrà riassegnato al selettore e il menu spostato su un'icona dedicata 🔧.
- **Profilo** (voce della barra, dec. 19) → *Il mio account*, *Ambienti*, *Sicurezza* (2FA, dispositivi, password), *Preferenze* (lingua, tema), *Privacy e dati* (esporta, elimina).
- **Ambienti → dettaglio ambiente**: dati del percorso, periodo, materie, moduli, "Elimina ambiente".

---

## 6. Stati

| Schermata | Vuoto | Caricamento | Errore | Offline | Privacy |
|---|---|---|---|---|---|
| ON-03/16 Accesso | — | Bottone in caricamento | Credenziali errate, email già usata, password debole | "Serve una connessione per accedere" | I testi dei consensi sono sempre visibili |
| ON-04 Verifica | — | Invio in corso | Codice errato o scaduto, troppi tentativi | Come sopra | — |
| ON-05 Dati personali | — | — | Campi obbligatori mancanti | Come sopra | Nota: "La data di nascita serve solo a verificare l'età minima" 🔧 |
| ON-10 Istituto | Nessun risultato → percorso N5 | Ricerca in corso | Errore di caricamento dell'elenco + "Riprova" | Come sopra | — |
| ON-13 Materie | "Aggiungi la tua prima materia" | — | Nome duplicato | Come sopra | — |
| Selettore ambienti | Impossibile (c'è sempre almeno un ambiente, salvo N9) | Skeleton | Cambio ambiente non riuscito | Si possono aprire solo gli ambienti già scaricati (dec. 54) 🔧 | Badge "Privato" |
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

**Da cosa dipende Fondazioni:** elenco interno degli istituti (dati e processo), testi legali (privacy, termini, consensi), scelta del backend (dec. 53).

---

## 8. Decisioni aperte (domande nuove)

**N1 — Importazione (dec. 70).** Hai risposto "per ora lascialo MVP". Intendi:
- **A.** Importazione **esclusa** dall'MVP; oppure
- **B.** Importazione **inclusa** nell'MVP? In questo caso servono fonti e formati, e ci sono vincoli con la dec. 58.

**N2 — Docente con più scuole.**
- **A.** Un ambiente per scuola, come per gli studenti. *Pro:* coerente con la dec. 62.
- **B.** Un solo ambiente docente con più istituti. *Pro:* una vista unica sull'orario.

**N3 — Come si accerta l'età.**
- **A.** Data di nascita obbligatoria in registrazione, poi modificabile solo con assistenza. *Pro:* applica la dec. 66. *Contro:* dato personale in più.
- **B.** Una semplice dichiarazione "Ho almeno 14 anni" (checkbox). *Pro:* minimizzazione dei dati. *Contro:* non permette di distinguere i 14-17enni per le protezioni dei minori.
- E inoltre: chi dichiara meno di 14 anni viene **bloccato prima di creare l'account** o l'account viene creato e **sospeso**? Una sospensione è recuperabile, o porta alla cancellazione dopo un certo tempo?

**N4 — Passaggio d'anno nello stesso ambiente.**
- **A.** Proposta automatica a fine periodo con conferma dell'utente (stile semi-automatico, dec. 6). Lo storico dell'anno precedente resta consultabile.
- **B.** Solo manuale, da Profilo → Ambiente.

**N5 — Istituto non presente nell'elenco.**
- **A.** Richiesta di aggiunta al team, mentre l'utente prosegue con un nome provvisorio.
- **B.** Blocco finché il team non lo aggiunge.
- E inoltre: cosa contiene l'elenco? Tutte le superiori statali e paritarie, tutti gli atenei e i corsi? Chi lo aggiorna?

**N6 — Recupero dell'accesso con la 2FA.**
- **A.** Codici di recupero monouso, generati alla configurazione.
- **B.** Recupero tramite assistenza.
- **C.** Entrambi.

**N7 — Verifica email.**
- **A.** Codice a 6 cifre da inserire nell'app.
- **B.** Link da aprire.
- E inoltre: l'email di Google o Apple (anche quella nascosta di Apple) conta già come verificata?

**N8 — 2FA per gli studenti: facoltativa od obbligatoria?**
- **A.** Facoltativa, con invito ad attivarla.
- **B.** Obbligatoria dal primo accesso su un nuovo dispositivo.

**N9 — Ultimo ambiente.**
- **A.** Non si può eliminare: serve sempre almeno un ambiente.
- **B.** Si può eliminare, e l'app riparte dalla creazione di un ambiente.

**N10 — Ruolo sbagliato durante l'onboarding.**
- **A.** Modificabile fino al riepilogo (ON-15), poi definitivo.
- **B.** Definitivo appena confermato.

---

## 9. Priorità

**MVP** (tutto già confermato dal briefing o dalle dec. 62–71):
- Registrazione e accesso con email/password, Google e Apple, verifica email.
- Soglia d'età di 14 anni.
- Ruolo per account; TOTP obbligatoria per i docenti; codice via email per gli studenti.
- Onboarding con configurazione completa: percorso, istituto dall'elenco, dettagli, periodo, materie, moduli.
- Ambienti multipli: creazione, cambio ed eliminazione.
- Profilo: account, sicurezza (dispositivi e revoca), preferenze di lingua e tema, esportazione ed eliminazione (dec. 60).

**In attesa di risposta:** importazione (N1), contenuto del passo Moduli (dec. 65).

**Fasi successive:** nessuna nuova funzione proposta. Restano escluse la vista aggregata (dec. 64) e le integrazioni funzionali (dec. 58).
