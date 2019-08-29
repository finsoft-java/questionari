--A quanto pare MYSQL non conserva la formattazione originale del comando CREATE VIEW... :(

CREATE OR REPLACE VIEW v_progetti_questionari AS
select p.id_progetto,p.titolo AS titolo_progetto,p.stato AS stato_progetto,p.utente_creazione AS ut_creaz_progetto,p.data_creazione AS data_creaz_progetto,
    q.id_questionario,q.titolo AS titolo_questionario,q.stato AS stato_questionario,q.flag_comune,q.utente_creazione AS ut_creaz_questionario,q.data_creazione AS data_creaz_questionario,
    x.tipo_questionario,x.gruppo_compilanti,x.gruppo_valutati,x.autovalutazione
from progetti p 
join progetti_questionari x on x.id_progetto = p.id_progetto
join questionari q on q.id_questionario = x.id_questionario;


CREATE OR REPLACE VIEW v_progetti_questionari_utenti AS
select p.id_progetto,p.titolo AS titolo_progetto,p.stato AS stato_progetto,p.utente_creazione AS ut_creaz_progetto,p.data_creazione AS data_creaz_progetto,
    q.id_questionario,q.titolo AS titolo_questionario,q.stato AS stato_questionario,q.flag_comune AS flag_comune,q.utente_creazione AS ut_creaz_questionario,q.data_creazione AS data_creaz_questionario,
    x.tipo_questionario,x.gruppo_compilanti,x.gruppo_valutati,x.autovalutazione,
    u.nome_utente,u.funzione
from progetti p 
join progetti_questionari x on x.id_progetto = p.id_progetto
join progetti_utenti u on u.id_progetto = p.id_progetto
join questionari q on q.id_questionario = x.id_questionario;



CREATE OR REPLACE VIEW v_ultimi_questionari_compilati AS
SELECT max(progressivo_quest_comp) as progressivo_quest_comp, id_progetto, id_questionario, utente_compilazione,
    (SELECT b.stato FROM questionari_compilati b WHERE a.progressivo_quest_comp=b.progressivo_quest_comp) as stato,
    (SELECT b.data_compilazione FROM questionari_compilati b WHERE a.progressivo_quest_comp=b.progressivo_quest_comp) as data_compilazione
FROM questionari_compilati a
WHERE stato <> '2'
GROUP BY id_progetto, id_questionario, utente_compilazione;



CREATE OR REPLACE VIEW v_questionari_compilabili_per_utente AS
SELECT p.id_progetto,p.titolo AS titolo_progetto,p.stato AS stato_progetto,
    q.id_questionario,q.titolo AS titolo_questionario,q.stato AS stato_questionario,
    x.tipo_questionario,x.gruppo_compilanti,x.gruppo_valutati,x.autovalutazione,
    u.nome_utente,u.funzione,
    qc.progressivo_quest_comp,qc.stato as stato_quest_comp,qc.data_compilazione
FROM progetti p
JOIN progetti_questionari x ON p.id_progetto=x.id_progetto
JOIN questionari q ON q.id_questionario=x.id_questionario
JOIN progetti_utenti u ON p.id_progetto=u.id_progetto
LEFT JOIN questionari_compilati qc ON qc.id_progetto=x.id_progetto AND qc.id_questionario=x.id_questionario
    AND qc.utente_compilazione=u.nome_utente AND qc.stato in ('0', '1')
WHERE q.stato = '1' AND p.stato = '1' AND x.gruppo_compilanti = u.funzione
     AND (qc.stato IS NULL OR qc.stato = '0');
-- spiegazione: prima escludo i '2', poi verifico che non ci sia nessun '1' 


CREATE OR REPLACE VIEW v_questionari_storici_per_utente AS
SELECT p.id_progetto,p.titolo AS titolo_progetto,p.stato AS stato_progetto,
    q.id_questionario,q.titolo AS titolo_questionario,q.stato AS stato_questionario,
    x.tipo_questionario,x.gruppo_compilanti,x.gruppo_valutati,x.autovalutazione,
    u.nome_utente,u.funzione,
    qc.progressivo_quest_comp,qc.stato as stato_quest_comp,qc.data_compilazione
FROM progetti p
JOIN progetti_questionari x ON p.id_progetto=x.id_progetto
JOIN questionari q ON q.id_questionario=x.id_questionario
JOIN progetti_utenti u ON p.id_progetto=u.id_progetto
JOIN questionari_compilati qc ON qc.id_progetto=x.id_progetto AND qc.id_questionario=x.id_questionario
    AND qc.utente_compilazione=u.nome_utente
WHERE qc.stato in ('1', '2') AND x.gruppo_compilanti = u.funzione;

         
CREATE OR REPLACE VIEW v_questionari_domande AS
SELECT q.id_questionario,s.progressivo_sezione,d.progressivo_domanda
from questionari q
join sezioni s on s.id_questionario = q.id_questionario
join domande d on d.id_questionario = s.id_questionario AND d.progressivo_sezione=s.progressivo_sezione;
