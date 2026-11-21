# Briefing master per Claude — Piattaforma per studenti

> Documento di discovery consolidato. Lingua di lavoro: italiano.  
> Stato: decisioni di prodotto confermate; progettazione di dettaglio da svolgere progressivamente.

## Prompt da consegnare a Claude

Agisci contemporaneamente come **product strategist**, **UX/UI designer senior** e **software architect** per una piattaforma digitale dedicata agli studenti. Devi trasformare questo briefing in una specifica di prodotto progressiva, concreta e verificabile.

### Regole inderogabili

1. Considera tutte le decisioni numerate sotto come **vincolanti**: non modificarle, non sostituirle con preferenze personali e non proporre alternative che le contraddicano.
2. Distingui sempre tra: requisiti confermati, dettagli da progettare, decisioni esplicitamente rinviate e idee future. Non presentare un elemento non deciso come se fosse confermato.
3. Non inventare requisiti di prodotto, regole di business, ruoli, integrazioni, limiti, prezzi, tecnologie o flussi mancanti. Quando sono necessari, elencali come domande/decisioni aperte.
4. Non trasformare le intenzioni future in funzionalità MVP. Mantieni la separazione fra “confermato ora”, “da approfondire” e “possibile evoluzione”.
5. Procedi **un modulo alla volta**. All’inizio scegli il modulo con maggiore dipendenza dagli altri e spiega brevemente perché; poi produci una proposta circoscritta e chiedi le decisioni indispensabili prima di avanzare.
6. Per ogni modulo, lavora nel seguente ordine: obiettivo e confini → utenti e casi d’uso → flussi → contenuti/informazioni → schermate e stati → permessi/privacy → dipendenze → priorità e dubbi aperti. Tratta l’architettura tecnica solo al livello richiesto dalle decisioni già prese.
7. Quando rilevi conflitti, ambiguità o conseguenze rilevanti, evidenziali senza risolverli arbitrariamente.
8. La piattaforma deve restare utile anche a uno studente senza docente collegato.

## Visione e posizionamento

Creare un **all-in-one student ecosystem**: il centro di controllo della vita scolastica e universitaria. Riunisce organizzazione, studio, rendimento, appunti e materiali, collaborazione e AI. Il valore primario non è un social network né un tutor: è permettere allo studente di avere sotto controllo lezioni, scadenze, attività, materiali e risultati in un unico ecosistema.

Il target iniziale è composto da studenti delle **scuole superiori italiane** e da studenti **universitari italiani**. L’esperienza deve adattarsi ai due percorsi: alle superiori classi, materie, professori, compiti, verifiche, interrogazioni e voti; all’università corsi, insegnamenti, CFU, appelli, esami, sessioni e carriera. Le scuole medie non fanno parte del perimetro iniziale.

Il lancio di prodotto è pensato per l’Italia; l’internazionalizzazione resta una possibilità futura, non un requisito da definire ora.

## Decisioni confermate (1–61)

### Fondazioni del prodotto

1. **Visione** — Ecosistema completo per studenti: organizzazione, studio, AI, rendimento e collaborazione.
2. **Target** — Superiori e università, con esperienze personalizzate per i due contesti.
3. **Personalizzazione** — Interfaccia comune e adattiva; moduli attivabili/disattivabili; funzioni differenziate per percorso; possibilità futura di estensione. La dashboard non è liberamente personalizzabile (vedi 21).
4. **Piattaforme** — Ecosistema multipiattaforma: web, iOS, Android, tablet ottimizzati e possibile app desktop futura; dati sincronizzati centralmente.
5. **Obiettivo principale** — Organizzare tutta la vita scolastica e universitaria, centralizzando informazioni, attività, materiali, scadenze e rendimento.
6. **Automazioni e AI** — Automazioni semi-automatiche: l’utente conferma le operazioni proposte. L’AI è a pagamento; struttura commerciale da definire più avanti.
7. **Mercato** — Italia: sistema scolastico e universitario italiano, inclusi voti, CFU, esami, appelli e crediti scolastici; possibile espansione futura.
8. **Registrazione/onboarding** — Email/password, Google Sign-In e Apple Sign-In; onboarding guidato e personalizzato per configurare il percorso, scegliere moduli e, se previsto in seguito, importare informazioni.
9. **Social e collaborazione** — Esperienza personale al centro, con collaborazione, condivisione di appunti/materiali e gruppi di studio; la componente social è prevista e si è poi concretizzata nella Community.
10. **Struttura dei profili** — Un account personale può contenere più ambienti indipendenti; dati e impostazioni restano separati, con cambio ambiente e possibile vista aggregata desiderata.
11. **Tipi di utente** — Studenti e insegnanti. Nessun profilo genitore nel progetto attuale.
12. **Profili insegnanti** — Ambiente gestionale: classi, studenti, compiti/attività, verifiche e scadenze, materiali, comunicazioni e calendari.
13. **Collegamento studenti-docenti** — Codici e link d’invito, ricerca di classi/insegnanti, richieste di partecipazione e approvazione. Il collegamento non è obbligatorio per usare l’app.
14. **Classi e community** — Classi scolastiche, gruppi universitari, gruppi privati di studio, community pubbliche/tematiche, gruppi temporanei per esami e spazi per materia.
15. **Privacy dei profili** — Visibilità personalizzabile, controllo sui dati condivisi e richieste di collegamento; contenuti personali privati per default; protezione dei minorenni.
16. **Identità** — Nome e cognome obbligatori; niente nickname come identità richiesta.

### Struttura, home e navigazione

17. **Dashboard principale** — Panoramica di lezioni/impegni, verifiche/esami/scadenze, attività, voti/andamento, notifiche e aggiornamenti.
18. **Navigazione** — Mobile-first: barra inferiore per sezioni principali e sidebar per funzioni/pagine secondarie; layout adattato allo schermo.
19. **Barra inferiore** — Home, Agenda, Attività, Community, Profilo. Materiali, voti e altre funzioni nella sidebar.
20. **Home** — Blocchi tematici, non widget liberi: Oggi; prossime scadenze; andamento; ultime attività; aggiornamenti Community.
21. **Personalizzazione Home** — Layout e sezioni uguali per tutti; contenuti adattati a profilo e percorso, senza riordino/nascondimento utente.

### Agenda, attività e rendimento personale

22. **Agenda** — Calendario accademico che integra lezioni/orari, compiti, verifiche/interrogazioni, esami, scadenze e appuntamenti.
23. **Inserimento eventi** — Inserimento manuale; inviti e condivisione da classi/gruppi/chat. Integrazioni rapide con AI, Siri e assistenti vocali sono solo future. Nessuna importazione automatica obbligatoria da calendari o documenti.
24. **Eventi condivisi** — Sistema ibrido: eventi personali con inviti ed eventi ufficiali di classe/gruppo; partecipazione gestita e visualizzazione nell’Agenda personale.
25. **Attività** — Sistema accademico distinto per compiti, verifiche, interrogazioni, esami, progetti/lavori di gruppo, consegne e scadenze, con gestione dedicata per tipo.
26. **Registro voti** — Inserimento manuale, medie automatiche, storico delle valutazioni, gestione distinta per materie ed esami. Non aggiungere analisi o previsioni non confermate.

### Materiali e appunti

27. **Materiali** — Archivio personale organizzabile per materie/corsi, con condivisione in classi, gruppi e Community e raccolte condivise.
28. **Sistema di appunti** — Editor avanzato, quaderni per materia/argomento, collegamento a lezioni/materie, annotazioni PDF, scrittura a mano, condivisione; priorità alta all’iPad e Apple Pencil.
29. **Quaderno digitale** — Esperienza professionale: Apple Pencil/penne, disegno e annotazione, registrazioni audio sincronizzate, ricerca nella scrittura a mano, PDF avanzati, template, esportazioni, sincronizzazione e collaborazione in tempo reale.

### Community, messaggi, classi e docenti

30. **Community** — Social network studentesco con feed, post, commenti/reazioni, profili, condivisione e scoperta. Classi e gruppi studio sono una sezione distinta, orientata al lavoro collaborativo.
31. **Contenuti Community** — Contenuti accademici e personali, inclusi post, immagini e risorse; categorie/argomenti per organizzazione e scoperta.
32. **Feed** — Algoritmico e personalizzato in base a interessi, interazioni e preferenze.
33. **Profili social** — Foto, nome/cognome, bio, post, follower/seguiti, interessi, post salvati e attività social. Restano soggetti alla privacy della decisione 15.
34. **Messaggistica** — Chat individuali e di gruppo, testo, vocali, immagini/file, risposte, reazioni e gestione conversazioni. Non sono confermate chiamate vocali/video.
35. **Classi e gruppi** — Classi/gruppi universitari, gruppi di studio privati, ruoli/permessi, chat, bacheche, materiali e attività condivise, eventi/calendario, strumenti didattici per docenti.
36. **Ambiente docente** — Gestione classi/studenti, presenze/assenze, lezioni/orari, verifiche/compiti, materiali e comunicazioni. I voti personali sono esclusivamente dello studente: docenti non li vedono né modificano.
37. **Privacy studenti-docenti** — Docenti vedono le informazioni strettamente necessarie per la classe; dati personali e voti restano privati; ulteriori informazioni solo con consenso esplicito.

### AI e modello commerciale

38. **AI** — Assistente di studio e produttività: riassunti, schemi, quiz, rielaborazione di appunti/documenti e organizzazione delle informazioni; disponibile in Agenda, Attività, Materiali, Appunti e Community. Ogni modifica richiede conferma. AI Premium.
39. **Interazione AI** — Chat centrale più AI contestuale nei moduli, con accesso solo al contesto personale autorizzato e azioni sempre confermate.
40. **Tutor AI** — Configurabile: spiegazioni semplici/approfondite, modalità insegnante, preparazione a verifiche/esami, esercizi guidati e modalità didattiche configurabili.
41. **Modello commerciale** — Piano Free + Premium + crediti AI acquistabili.
42. **Offerta commerciale** — Cosa includono Free, Premium e crediti è volutamente rinviato; nessun limite, prezzo o vantaggio è definito.

### Esperienza trasversale e design

43. **Notifiche** — Solo centro notifiche interno, disponibile in app e web; nessuna push o email confermata.
44. **Categorie di notifiche** — Tutte le categorie possibili, attivabili/disattivabili singolarmente dall’utente.
45. **Ricerca globale** — Una barra semplice per pagine, persone, gruppi e contenuti; nessuna ricerca AI o filtri avanzati per ora.
46. **Lingue** — Italiano e inglese al lancio; lingua configurabile; testi dell’interfaccia localizzati.
47. **Accessibilità** — Supporto standard alle principali funzioni native dei sistemi operativi; non è confermato un pannello di accessibilità avanzato dedicato.
48. **Tema** — Chiaro, scuro e automatico secondo il sistema.
49. **Personalizzazione grafica** — Aspetto uniforme; nessuna modifica a colori, font o layout oltre al tema.
50. **Identità visiva** — Minimal, professionale, ordinata e moderna; riferimenti: Notion e Linear.

### Sviluppo, dati, sicurezza e governance

51. **Strategia di sviluppo** — App-first: prima iOS e Android, poi web; il mobile guida le priorità UX.
52. **Tecnologia mobile** — React Native con Expo; sviluppo/prototipazione iniziale in Expo Go; possibilità futura di usare Xcode e moduli/progetti nativi iOS senza riscrittura totale.
53. **Backend/database** — Scelta rinviata alla progettazione tecnica. Dovrà supportare sincronizzazione, scalabilità e dati condivisi; non selezionare Firebase, Supabase o backend custom senza una decisione successiva.
54. **Offline** — Consultazione offline essenziale dei contenuti già caricati (appunti, materiali e Agenda). Le modifiche offline non sono confermate.
55. **Sincronizzazione** — Automatica appena disponibile una connessione, su tutti i dispositivi dell’account. La gestione dei conflitti non è definita.
56. **Sicurezza account** — Email/password, 2FA, Google/Apple Sign-In, gestione sessioni e dispositivi collegati.
57. **Gamification** — Esclusa: niente punti, badge, livelli, streak, classifiche o competizioni.
58. **Integrazioni esterne** — Nessuna integrazione di terze parti nel perimetro attuale; strumenti gestiti internamente. Questa decisione prevale sulle idee future di Siri/assistenti della decisione 23, che restano solo spunti da riesaminare esplicitamente.
59. **Verifica account** — Verifica email obbligatoria; nessuna verifica di iscrizione a scuola/università; registrazione accessibile a tutti.
60. **Dati utente** — L’utente può consultare, modificare, esportare e cancellare tutti i propri dati.
61. **Sicurezza e moderazione** — Sistema avanzato: segnalazione e blocco utenti, filtri/controlli automatici, moderazione umana con ruoli/permessi, protezioni specifiche per minorenni e possibilità di contestare decisioni di moderazione.

## Decisioni rinviate, sospese o da dettagliare

Non trattare queste aree come decise:

- Scelta di backend, database, storage, API, hosting, infrastruttura, schema dati, autorizzazioni tecniche, backup, recovery/versionamento e monitoraggio.
- Dettagli della sincronizzazione, conflitti, consistenza dei dati, cache locale e politica offline in modifica.
- Piano di sviluppo per web/desktop, watch e funzionalità native; React Native + Expo è definito solo come partenza mobile.
- Contenuti, limiti, prezzi e metriche di Free/Premium/crediti AI.
- Dettaglio delle integrazioni AI, provider, costi, modalità vocali/multimodali, confini dei dati inviati e policy di consenso.
- Integrazioni esterne: al momento sono escluse. Siri/assistenti erano una possibilità futura menzionata prima della decisione 58 e richiederebbero una nuova approvazione.
- Regole granulari di feed, ranking, scoperta, messaggistica, blocco, età, consenso, moderazione e ricorso; definire senza compromettere privacy/minori.
- Dettagli operativi del registro docente, inclusi ruoli istituzionali e processi di adozione da parte di scuole/atenei.
- Flussi completi di importazione: l’onboarding può prevederla, ma non sono decisi formati, fonti o automatismi.
- La precedente domanda sui backup è stata esplicitamente sospesa; nessuna scelta di backup è valida.

## Metodo per la prossima fase, modulo per modulo

Parti con **Fondazioni di dominio e configurazione dell’ambiente**: account personale, ambienti indipendenti, percorso superiore/università, moduli e onboarding. È il modulo da cui dipendono Agenda, Attività, voto, Home e permessi.

Per ciascun modulo successivo, restituisci:

1. confine del modulo e requisito confermato;
2. utenti e responsabilità;
3. user journey essenziali e casi limite;
4. inventario dei dati a livello concettuale, senza scegliere database;
5. mappa delle schermate mobile-first con navigazione/sidebar;
6. stati vuoti, errore, caricamento e privacy;
7. dipendenze con altri moduli;
8. decisioni aperte formulate come domande brevi con alternative e trade-off;
9. proposta di priorità MVP/fasi successive, senza assegnare automaticamente nuove funzionalità.

Ordine consigliato dopo il primo modulo: Agenda/eventi → Attività → materiali/appunti → registro voti → classi/gruppi/docenti → Community/messaggi → AI → impostazioni, dati e moderazione. Rivaluta l’ordine se emergono dipendenze, spiegandolo.

## Output iniziale richiesto a Claude

Non creare subito una soluzione tecnica completa. Rispondi prima con:

1. un riepilogo conciso dei vincoli che hai recepito;
2. le ambiguità o tensioni reali del briefing (in particolare integrazioni future vs assenza di integrazioni esterne);
3. il piano della fase “Fondazioni di dominio e configurazione dell’ambiente”;
4. soltanto le domande necessarie per completare quel modulo.

