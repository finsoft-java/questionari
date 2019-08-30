<?php

$questionariCompilatiManager = new QuestionariCompilatiManager();
class QuestionarioCompilato {
    private $_progetto;
    private $_questionario;
    private $_tutte_le_risposte;
    
    function get_questionario() {
        global $questionariManager;
        if (!$this->_questionario) {
            $this->_questionario = $questionariManager->get_questionario($this->id_questionario);
        }
        return $this->_questionario;
    }

    function get_progetto() {
        global $progettiManager;
        if (!$this->_progetto) {
            $this->_progetto = $progettiManager->get_progetto($this->id_progetto);
        }
        return $this->_progetto;
    }
    
    function get_utenti_valutati() {
        if (!isset($this->utenti_valutati)) {
            global $con;
            $arr = [];
            $sql = "SELECT * FROM `v_progetti_questionari_utenti` WHERE `id_progetto`='$this->id_progetto' AND ".
                " `id_questionario`='$this->id_questionario' AND `funzione`=`gruppo_valutati` ";
            
            if($result = mysqli_query($con, $sql)) {
                $cr = 0;
                while($row = mysqli_fetch_assoc($result))
                {
                    $arr[$cr++] = $row["nome_utente"];
                }
            } else {
                print_error(500, $con ->error);
            }
            $this->utenti_valutati = $arr;
        }
        return $this->utenti_valutati;
    }

    /**
     * Restituisce in un unico oggetto la sezione, le domande, e le relative risposte utente.
     */
    function get_sezione($progressivo_sezione, $nome_utente_valutato) {

        return $questionariCompilatiManager->get_sezione($this->progressivo_quest_comp, $progressivo_sezione, $nome_utente_valutato);
    }

    function get_tutte_le_risposte_divise_per_utente() {
        if (!$this->_tutte_le_risposte) {
            global $con;
            $arr = [];
            foreach ($this->get_utenti_valutati() as $u) {
                $arr[$u] = [];
            }
            
            $sql = "SELECT * FROM risposte_quest_compilati WHERE progressivo_quest_comp = '$this->progressivo_quest_comp' ";
            if($result = mysqli_query($con, $sql)) {
                while($row = mysqli_fetch_assoc($result))
                {
                    $obj = new QuestionarioCompilatoRisposta();
                    $obj->progressivo_quest_comp    = $row['progressivo_quest_comp'];
                    $obj->progressivo_sezione       = $row['progressivo_sezione'];
                    $obj->progressivo_domanda       = $row['progressivo_domanda'];
                    $obj->nome_utente_valutato      = $row['nome_utente_valutato'];
                    $obj->progressivo_risposta      = $row['progressivo_risposta'];
                    $obj->note                      = $row['note'];
                    $arr[$obj->nome_utente_valutato][] = $obj;
                }
            } else {
                print_error(500, $con ->error);
            }
            $this->_tutte_le_risposte = $arr;
        }
        return $this->_tutte_le_risposte;
    }
    
    /**
     * Cerco la prima domanda ancora non compilata
     * $nome_utente_valutato può essere null (questionari generici)
     */
    function get_progr_sezione_corrente($nome_utente_valutato) {
        global $con;
        $sql = "SELECT MIN(progressivo_sezione) AS progressivo_sezione FROM risposte_quest_compilati WHERE " .
                "progressivo_quest_comp = $this->progressivo_quest_comp " . 
                "AND progressivo_risposta IS NULL AND note IS NULL";
        if ($nome_utente_valutato) {
            $sql .= " AND nome_utente_valutato = '$nome_utente_valutato' ";
        }
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                $progressivo_sezione = $row['progressivo_sezione'];
                if (!is_null($progressivo_sezione)) {
                    return $progressivo_sezione;
                }
            }
        } else {
            print_error(500, $con ->error);
        }
        // Se arrivo qui, tutte le domande sono state compilate
        return $this->get_progr_ultima_sezione();
    }
    
    function get_progr_ultima_sezione() {
        global $con;
        $sql = "SELECT MAX(progressivo_sezione) AS progressivo_sezione FROM risposte_quest_compilati " .
                "WHERE progressivo_quest_comp = $this->progressivo_quest_comp";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                return $row['progressivo_sezione'];
            }
        } else {
            print_error(500, $con ->error);
        }
    }
    
    function is_compilabile() {
        return ($this->stato < '2') and ($this->get_progetto()->stato == '1') and ($this->get_questionario()->stato == '1');
    }
}

class QuestionarioCompilatoRisposta {
    private $questionario_compilato;
    private $sezione;
    private $domanda;
    private $risposta;
    
    function get_questionario_compilato() {
        global $questionariCompilatiManager;
        if (!$this->questionario_compilato) {
            $this->questionario_compilato = $questionariCompilatiManager->get_questionario_compilato($this->progressivo_quest_comp);
        }
        return $this->questionario_compilato;
    }

    function get_sezione() {
        if (!$this->sezione) {
            $this->sezione = $this->get_questionario_compilato()->get_questionario()->get_sezione($this->progressivo_sezione);
        }
        return $this->sezione;
    }

    function get_domanda() {
        if (!$this->domanda) {
            $this->domanda = $this->get_sezione()->get_domanda($this->progressivo_domanda);
        }
        return $this->domanda;
    }

    function get_risposta() {
        if (!$this->risposta and $this->progressivo_risposta) {
            $this->risposta = $this->get_domanda()->get_risposta($this->progressivo_risposta);
        }
        return $this->risposta;
    }
    
    function get_num_o_note() {
        if ($this->note) {
            return note;
        }
        if ($this->progressivo_risposta) {
            return $this->get_risposta()->descrizione;
        }
    }
    
    function get_valore() {
        if ($this->progressivo_risposta) {
            return $this->get_risposta()->valore;
        } else {
            return 0;
        }
    }
}

class VistaQuestionariCompilabili {
    private $questionario;
    private $progetto;
    private $ultimo_quest_comp;
    private $utenti_valutati;
    
    function get_questionario() {
        global $questionariManager;
        if (!$this->questionario) {
            $this->questionario = $questionariManager->get_questionario($this->id_questionario);
        }
        return $this->questionario;
    }

    function get_progetto() {
        global $progettiManager;
        if (!$this->progetto) {
            $this->progetto = $progettiManager->get_progetto($this->id_progetto);
        }
        return $this->progetto;
    }

    /**
     * Restituisce tutti gli utenti del progetto
     * 
     * @return lista di oggetti ProgettoUtenti
     */
    function get_progetto_utenti() {
        return $this->get_progetto()->get_progetti_utenti();
    }

    /**
     * Restituisce, tra gli utenti del progetto, quelli che sono da valutare
     * 
     * @return lista di stringhe (soltanto il nome utente)
     */
    function get_utenti_valutati() {
        global $progettiManager;
        if (!$this->utenti_valutati){
            global $con;
            $include_me = ($this->autovalutazione == '1');
            $funzione = $this->gruppo_valutati;
            $progetto_utenti_valutati = $progettiManager->get_progetto_utenti($this->id_progetto, $funzione, $include_me);
            $this->utenti_valutati = array_map(function($x) {return $x->nome_utente;}, $progetto_utenti_valutati);
        }
        return $this->utenti_valutati;
    }

    /**
     * @return un QuestionarioCompilato, oppure null
     */
    function get_ultimo_questionario_compilato() {
        global $questionariCompilatiManager;
        if (!$this->progressivo_quest_comp) {
            return null;
        }
        if (!$this->ultimo_quest_comp) {
            $this->ultimo_quest_comp = $questionariCompilatiManager->get_questionario_compilato($this->progressivo_quest_comp);
        } 
        return $ultimo_quest_comp;
    }
}

class QuestionariCompilatiManager {
    
    function get_questionario_compilato($progressivo_quest_comp, $utente_valutato_or_null = null, $sezione_corrente_or_null = null) {
        global $con, $STATO_QUEST_COMP;
        $obj = new QuestionarioCompilato();
        $sql = "SELECT * FROM questionari_compilati WHERE progressivo_quest_comp = '$progressivo_quest_comp'";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                $obj->progressivo_quest_comp    = $row['progressivo_quest_comp'];
                $obj->id_progetto               = $row['id_progetto'];
                $obj->id_questionario           = $row['id_questionario'];
                $obj->stato                     = $row['stato'];
                $obj->stato_dec                 = $STATO_QUEST_COMP[$row['stato']];
                $obj->utente_compilazione       = $row['utente_compilazione'];
                $obj->data_compilazione         = $row['data_compilazione'];
                $obj->compilabile               = $obj->is_compilabile();
                $obj->sezioni                   = $obj->get_questionario()->get_sezioni(); // solo la lista, non esplosa
                $obj->utenti_valutati           = $obj->get_utenti_valutati();
                $obj->progetto                  = $obj->get_progetto();
                $obj->questionario              = $obj->get_questionario();
                
            } else {
                return null;
            }
        } else {
          print_error(500, $con ->error);
        }
        return $obj;
    }
    
    /*
     * Restituisce le risposte (non necessariamente compilate) per la sezione data.
     * $progressivo_sezione potrebbe essere null (scaricamento xlsx)
     * $nome_utente_valutato potrebbe essere null (questionari generici o scaricamento xlsx)
     */
    function get_risposte($progressivo_quest_comp, $progressivo_sezione, $nome_utente_valutato) {
        global $con;
        $arr = [];
        
        $sql = "SELECT * FROM risposte_quest_compilati WHERE progressivo_quest_comp = '$progressivo_quest_comp' ";
        if ($progressivo_sezione) {
            $sql .= " AND progressivo_sezione = '$progressivo_sezione'";
        }
        if ($nome_utente_valutato) {
            $sql .= " AND nome_utente_valutato = '$nome_utente_valutato'";
        }
                        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $obj = new VistaQuestionariCompilabili();
                $obj->progressivo_quest_comp    = $row['progressivo_quest_comp'];
                $obj->progressivo_sezione       = $row['progressivo_sezione'];
                $obj->progressivo_domanda       = $row['progressivo_domanda'];
                $obj->nome_utente_valutato      = $row['nome_utente_valutato'];
                $obj->progressivo_risposta      = $row['progressivo_risposta'];
                $obj->note                      = $row['note'];
                $arr[$cr++] = $obj;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }

    /**
     * Carica una sezione del questionario da compilare.
     * Restituisce in un unico oggetto la sezione, le domande, e le relative risposte utente.
     * Se utente e sezione sono nulli, cerca di "indovinare" quale deve caricare.
     */
    function get_sezione_questionario_compilato($progressivo_quest_comp, $progressivo_sezione = null, $utente_valutato = null) {
        $q = $this->get_questionario_compilato($progressivo_quest_comp);

        if (!$utente_valutato) {
            if ($obj->get_utenti_valutati()) {
                $utente_valutato = $obj->get_utenti_valutati()[0];
                // Altrimenti, è un questionario generico, non prevede utenti da valutare
            }
        }
        if (!$progressivo_sezione) {
            $progressivo_sezione = $q->get_progr_sezione_corrente($utente_valutato);
            //se non ce ne sono, bisogna lanciare un errore
        }

        $sezione = $q->get_questionario()->get_sezione($progressivo_sezione);
        $risposte = $this->get_risposte($progressivo_quest_comp, $progressivo_sezione, $utente_valutato);
        foreach ($sezione->domande as $d) {
            foreach ($risposte as $r) {
                if ($r->progressivo_domanda == $d->progressivo_domanda) {
                    $d->risposta = $r;
                    break;
                }
            }
        }
        return $sezione;
    }

    function get_questionari_compilati($id_progetto, $id_questionario) {
        global $con, $STATO_QUEST_COMP;
        $arr = [];
        $sql = "SELECT * FROM questionari_compilati WHERE id_progetto = '$id_progetto' AND id_questionario = '$id_questionario'";
        
        //TODO sarebbe comodo aggiugnere l'informazione di quale sia la prossima sezione da compilare
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result)) {
                $obj = new QuestionarioCompilato();
                $obj->progressivo_quest_comp   = $row['progressivo_quest_comp'];
                $obj->id_progetto              = $row['id_progetto'];
                $obj->id_questionario          = $row['id_questionario'];
                $obj->stato                    = $row['stato'];
                $obj->stato_dec                = $STATO_QUEST_COMP[$row['stato']];
                $obj->utente_compilazione      = $row['utente_compilazione'];
                $obj->data_compilazione        = $row['data_compilazione'];
                //TODO caricare domande e risposte
                $arr[$cr++] = $obj;
            }
        } else {
          print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_vista_questionario_compilabile_o_compilato($id_progetto, $id_questionario) {
        global $con,$STATO_PROGETTO,$STATO_QUESTIONARIO,$STATO_QUEST_COMP,$GRUPPI,$BOOLEAN;
        $sql = "SELECT * FROM v_questionari_compilabili_per_utente WHERE id_progetto = '$id_progetto' AND id_questionario = '$id_questionario' ";
        $obj = new VistaQuestionariCompilabili();
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result))
            {
                
                if($row['gruppo_compilanti'] != null){
                    $gruppo_compilanti = $row['gruppo_compilanti'];
                    $gruppo_compilanti_dec = $GRUPPI[$row['gruppo_compilanti']];
                } else {
                    $gruppo_compilanti = null;
                    $gruppo_compilanti_dec = null;
                }
                if($row['gruppo_valutati'] != null){
                    $gruppo_valutati = $row['gruppo_valutati'];
                    $gruppo_valutati_dec = $GRUPPI[$row['gruppo_valutati']];
                } else {
                    $gruppo_valutati = null;
                    $gruppo_valutati_dec = null;
                }
                if($row['stato_quest_comp'] != null){
                    $stato_quest_comp       = $row['stato_quest_comp'];
                    $stato_quest_comp_dec   = $STATO_QUEST_COMP[$row['stato_quest_comp']];
                } else {                    
                    $stato_quest_comp       = null;
                    $stato_quest_comp_dec   = null;
                }

                $obj->id_progetto            = $row['id_progetto'];
                $obj->titolo_progetto        = $row['titolo_progetto'];
                $obj->stato_progetto         = $row['stato_progetto'];
                $obj->stato_progetto_dec     = $STATO_PROGETTO[$row['stato_progetto']];
                $obj->id_questionario        = $row['id_questionario'];
                $obj->titolo_questionario    = $row['titolo_questionario'];
                $obj->stato_questionario     = $row['stato_questionario'];
                $obj->stato_questionario_dec = $STATO_QUESTIONARIO[$row['stato_questionario']];
                $obj->gruppo_compilanti      = $gruppo_compilanti;
                $obj->gruppo_compilanti_dec  = $gruppo_compilanti_dec;
                $obj->gruppo_valutati        = $gruppo_valutati;
                $obj->gruppo_valutati_dec    = $gruppo_valutati_dec;
                $obj->autovalutazione        = $row['autovalutazione'];
                $obj->autovalutazione_dec    = $BOOLEAN[$row['autovalutazione']];
                $obj->progressivo_quest_comp = $row['progressivo_quest_comp'];
                $obj->stato_quest_comp       = $stato_quest_comp;
                $obj->stato_quest_comp_dec   = $stato_quest_comp_dec;
                $obj->data_compilazione      = $row['data_compilazione'];
                $obj->nome_utente            = $row['nome_utente'];

            } else {
                return null;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $obj;
    }
    
    function get_vista_questionari_compilabili_o_compilati($storici, $id_progetto_or_null = null, $id_questionario_or_null = null) {
        global $con, $logged_user, $BOOLEAN, $STATO_QUESTIONARIO, $STATO_PROGETTO, $GRUPPI, $STATO_QUEST_COMP;
        $arr = [];
        if ($storici) {
            $vista = "v_questionari_storici_per_utente";
        } else {
            $vista = "v_questionari_compilabili_per_utente";
        }
        $sql = "SELECT * FROM $vista WHERE 1=1 ";
        if (!($storici and utente_admin())) {
            // solo gli amministratori possono vedere tutto, e solo nella pagina dello storico
            $sql .= " AND nome_utente = '$logged_user->nome_utente' ";
        }
        if ($id_progetto_or_null) {
            $sql .= " AND id_progetto = '$id_progetto_or_null' ";
        }
        if ($id_questionario_or_null) {
            $sql .= " AND id_questionario = '$id_questionario_or_null' ";
        }

        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                if($row['stato_quest_comp'] != null){
                    $stato_quest_comp       = $row['stato_quest_comp'];
                    $stato_quest_comp_dec   = $STATO_QUEST_COMP[$row['stato_quest_comp']];
                }else{                    
                    $stato_quest_comp       = null;
                    $stato_quest_comp_dec   = null;
                }
                $obj = new VistaQuestionariCompilabili();
                $obj->id_progetto            = $row['id_progetto'];
                $obj->titolo_progetto        = $row['titolo_progetto'];
                $obj->stato_progetto         = $row['stato_progetto'];
                $obj->stato_progetto_dec     = $STATO_PROGETTO[$row['stato_progetto']];
                $obj->id_questionario        = $row['id_questionario'];
                $obj->titolo_questionario    = $row['titolo_questionario'];
                $obj->stato_questionario     = $row['stato_questionario'];
                $obj->stato_questionario_dec = $STATO_QUESTIONARIO[$row['stato_questionario']];
                $obj->gruppo_compilanti      = $row['gruppo_compilanti'];
                $obj->gruppo_compilanti_dec  = $GRUPPI[$row['gruppo_compilanti']];
                $obj->gruppo_valutati        = $row['gruppo_valutati'];
                $obj->gruppo_valutati_dec    = $GRUPPI[$row['gruppo_valutati']];
                $obj->autovalutazione        = $row['autovalutazione'];
                $obj->autovalutazione_dec    = $BOOLEAN[$row['autovalutazione']];
                $obj->progressivo_quest_comp = $row['progressivo_quest_comp'];
                $obj->stato_quest_comp       = $stato_quest_comp;
                $obj->stato_quest_comp_dec   = $stato_quest_comp_dec;
                $obj->data_compilazione      = $row['data_compilazione'];
                $obj->nome_utente            = $row['nome_utente'];
                $arr[$cr++] = $obj;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }

    function crea_questionario_compilato($questionarioCompilabile) {
        global $con, $logged_user;
        
        $sql = "UPDATE questionari SET gia_compilato='1' WHERE id_questionario = '$questionarioCompilabile->id_questionario'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        $sql = "UPDATE progetti SET gia_compilato='1' WHERE id_progetto = '$questionarioCompilabile->id_progetto'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        $sql = insert("questionari_compilati", ["progressivo_quest_comp" => null,
                                                "id_progetto" => $questionarioCompilabile->id_progetto,
                                                "id_questionario" => $questionarioCompilabile->id_questionario,
                                                "stato" => "0",
                                                "utente_compilazione" => $logged_user->nome_utente]);
                                                //no data_compilazione
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $progressivo_quest_comp = mysqli_insert_id($con);
        $utenti_valutati = $questionarioCompilabile->get_utenti_valutati();
        foreach($utenti_valutati as $utente_valutato) {
            $sql = "INSERT INTO `risposte_quest_compilati`(`progressivo_quest_comp`, `progressivo_sezione`, `progressivo_domanda`, `nome_utente_valutato`) " .
                    "SELECT $progressivo_quest_comp, progressivo_sezione, progressivo_domanda, '$utente_valutato' ".
                    "FROM v_questionari_domande " .
                    "WHERE id_questionario = '$questionarioCompilabile->id_questionario' ";
            mysqli_query($con, $sql);
            if ($con ->error) {
                print_error(500, $con ->error);
            }
        }
        
        return $this->get_questionario_compilato($progressivo_quest_comp);
    }
    
    function update_risposte($json_data_array) {
        // Mi aspetto che il frontend salvi in una botta sola tutte le risposte della sezione corrente
        // e che le passi in un array
        foreach ($json_data as $json_data) {
            $this->update_singola_risposta($json_data);
        }
    }
    
    function update_singola_risposta($json_data) {
        global $con;
        $sql = update("risposte_quest_compilati", ["progressivo_risposta" => $json_data->progressivo_risposta,
                                                   "note" => $json_data->note],
                                                  ["progressivo_quest_comp" => $json_data->progressivo_quest_comp,
                                                   "progressivo_sezione" => $json_data->progressivo_sezione,
                                                   "progressivo_domanda" => $json_data->progressivo_domanda,
                                                   "nome_utente_valutato" => $json_data->nome_utente_valutato]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
    }

    function cambia_stato($questionario_compilato, $nuovo_stato) {
        global $con;
        $sql = "UPDATE questionari_compilati SET stato='$nuovo_stato' WHERE progressivo_quest_comp = '$questionario_compilato->progressivo_quest_comp'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $questionario_compilato->stato = $nuovo_stato;
        return $questionario_compilato;
    }
    
}

?>