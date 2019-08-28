<?php

$sezioniManager = new SezioniManager();

class Sezione {
    private $questionario;
    
    function get_questionario() {
        if (!$this->questionario) {
            $this->questionario = $questionariManager->get_questionario($this->id_questionario);
        }
        return $this->questionario;
    }
    
    function get_domanda($progressivo_domanda, $explode = true) {
        global $con, $BOOLEAN, $HTML_TYPE;
        $domanda = new Domanda();
        $sql = "SELECT * FROM domande WHERE id_questionario = '$this->id_questionario' AND progressivo_sezione = '$this->progressivo_sezione' " .
                "AND progressivo_domanda = '$progressivo_domanda'";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                $domanda->progressivo_domanda   = $row['progressivo_domanda'];
                $domanda->descrizione           = $row['descrizione'];
                $domanda->obbligatorieta        = $row['obbligatorieta'];
                $domanda->obbligatorieta_dec    = $BOOLEAN[$row['obbligatorieta']];
                $domanda->rimescola             = $row['rimescola'];
                $domanda->rimescola_dec         = $BOOLEAN[$row['rimescola']];
                $domanda->coeff_valutazione     = $row['coeff_valutazione'];
                $domanda->html_type             = $row['html_type'];
                $domanda->html_type_dec         = $HTML_TYPE[$row['html_type']];
                $domanda->html_pattern          = $row['html_pattern'];
                $domanda->html_min              = $row['html_min'];
                $domanda->html_max              = $row['html_max'];
                $domanda->html_maxlenght        = $row['html_maxlenght'];
                if ($explode) {
                    $domanda->risposte_ammesse  = $domanda->get_risposte();
                }
            } else {
                return null;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $domanda;
    }

    function get_domande($explode = true) {
        if (!isset($this->domande)) {
            global $con, $BOOLEAN, $HTML_TYPE;
            $html_type = '';
           
            $arr = [];
            $sql = "SELECT * FROM domande WHERE id_questionario = '$this->id_questionario' AND progressivo_sezione = '$this->progressivo_sezione' ORDER BY progressivo_domanda";
            if($result = mysqli_query($con, $sql)) {
                $cr = 0;
                while($row = mysqli_fetch_assoc($result))
                {
                    if($row['html_type'] == ''){
                        $html_type = 0;
                    }else{
                        $html_type =$row['html_type'];
                    }
                    $obj = new Domanda();
                    $obj->id_questionario       = $row['id_questionario'];
                    $obj->progressivo_sezione   = $row['progressivo_sezione'];
                    $obj->progressivo_domanda   = $row['progressivo_domanda'];
                    $obj->descrizione           = $row['descrizione'];
                    $obj->obbligatorieta        = $row['obbligatorieta'];
                    $obj->obbligatorieta_dec    = $BOOLEAN[$row['obbligatorieta']];
                    $obj->rimescola             = $row['rimescola'];
                    $obj->rimescola_dec         = $BOOLEAN[$row['rimescola']];
                    $obj->coeff_valutazione     = $row['coeff_valutazione'];
                    $obj->html_type             = $html_type;
                    $obj->html_type_dec         = $HTML_TYPE[$html_type];
                    $obj->html_pattern          = $row['html_pattern'];
                    $obj->html_min              = $row['html_min'];
                    $obj->html_max              = $row['html_max'];
                    $obj->html_maxlenght        = $row['html_maxlenght'];
                    if ($explode) {
                        $obj->risposte          = $obj->get_risposte();
                    }
                    $arr[$cr++] = $obj;
                }
            } else {
                print_error(500, $con ->error);
            }
            $this->domande = $arr;
        }
        return $this->domande;
    }
}

class Domanda {
    private $questionario;
    private $sezione;
    
    function get_questionario() {
        if (!$this->questionario) {
            $this->questionario = $questionariManager->get_questionario($this->id_questionario);
        }
        return $this->questionario;
    }
    
    function get_sezione() {
        if (!$this->sezione) {
            $this->sezione = $this->get_questionario()->get_sezione($this->progressivo_sezione);
        }
        return $this->sezione;
    }

    function get_risposte() {
        if (!isset($this->risposte)) {
            global $con;
            $arr = [];
            $sql = "SELECT * FROM risposte_ammesse WHERE id_questionario = '$this->id_questionario' AND progressivo_sezione = '$this->progressivo_sezione' " .
                    " AND progressivo_domanda = '$this->progressivo_domanda' ORDER BY progressivo_risposta";
            if($result = mysqli_query($con, $sql)) {
                $cr = 0;
                while($row = mysqli_fetch_assoc($result))
                {
                    $obj = new RispostaAmmessa();
                    $obj->id_questionario       = $row['id_questionario'];
                    $obj->progressivo_sezione   = $row['progressivo_sezione'];
                    $obj->progressivo_domanda   = $row['progressivo_domanda'];
                    $obj->progressivo_risposta  = $row['progressivo_risposta'];
                    $obj->descrizione           = $row['descrizione'];
                    $obj->valore                = $row['valore'];
                    $arr[$cr++] = $obj;
                }
            } else {
                print_error(500, $con ->error);
            }
            $this->risposte = $arr;
        }
        return $this->risposte;
    }

    function is_domanda_aperta() {
        return !$this->get_risposte();
    }
}

class RispostaAmmessa {
    private $questionario;
    private $sezione;
    private $domanda;
    
    function get_questionario() {
        if (!$this->questionario) {
            $this->questionario = $questionariManager->get_questionario($this->id_questionario);
        }
        return $this->questionario;
    }
    
    function get_sezione() {
        if (!$this->sezione) {
            $this->sezione = $this->get_questionario()->get_sezione($this->progressivo_sezione);
        }
        return $this->sezione;
    }

    function get_domanda() {
        if (!$this->domanda) {
            $this->domanda = $this->get_sezione()->get_domanda($this->progressivo_domanda);
        }
        return $this->domanda;
    }
}

class SezioniManager {

    function crea($json_data) {
        global $con, $logged_user;
        $sql = insert("sezioni", ["id_questionario" => $json_data->id_questionario,
                                  "progressivo_sezione" => $json_data->progressivo_sezione,
                                  "titolo" => $json_data->titolo,
                                  "descrizione" => $json_data->descrizione]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        return $sezioniManager->get_sezione($json_data->id_questionario, $json_data->progressivo_sezione);
    }
    
    function aggiorna($sezione, $json_data) {
        global $con;
        $sql = update("sezioni", ["titolo" => $json_data->titolo,
                                  "descrizione" => $json_data->descrizione],
                                 ["id_questionario" => $sezione->id_questionario,
                                  "progressivo_sezione" => $sezione->progressivo_sezione]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        $sezione->titolo = $json_data->titolo;
        $sezione->descrizione = $json_data->descrizione;
        return $sezione;
    }
    
    function elimina($id_questionario, $progressivo_sezione) {
        global $con;
        $sql = "DELETE FROM sezioni WHERE id_questionario = '$id_questionario' AND progressivo_sezione = '$progressivo_sezione'"; //on delete cascade!
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
    }

    function duplica($sezione) {
        global $con;
        $nuovo_progressivo_sezione = $sezione->get_questionario()->get_prossima_sezione();
        $sql = insert_select("sezioni", ["id_questionario", "progressivo_sezione", "titolo", "descrizione"],
                                        ["progressivo_sezione" => $nuovo_progressivo_sezione],
                                        ["id_questionario" => $sezione->id_questionario,
                                        "progressivo_sezione" => $sezione->progressivo_sezione]
                                        );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
        $this->_duplica_domande($sezione, $nuovo_progressivo_sezione);
        $this->_duplica_risposte($sezione, $nuovo_progressivo_sezione);
        return $sezioniManager->get_sezione($sezione->id_questionario, $nuovo_progressivo_sezione);
    }

    function _duplica_domande($sezione, $nuovo_progressivo_sezione) {
        global $con;
        $sql = insert_select("domande", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "descrizione", "obbligatorieta", "coeff_valutazione", "html_type", "html_pattern", "html_min", "html_max", "html_maxlenght", "rimescola"],
                                                 ["progressivo_sezione" => $nuovo_progressivo_sezione],
                                                 ["id_questionario" => $sezione->id_questionario,
                                                 "progressivo_sezione" => $sezione->progressivo_sezione]
                                                );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }

    function _duplica_risposte($sezione, $nuovo_progressivo_sezione) {
        global $con;
        $sql = insert_select("risposte_ammesse", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "progressivo_risposta", "descrizione", "valore"],
                                             ["progressivo_sezione" => $nuovo_progressivo_sezione],
                                             ["id_questionario" => $sezione->id_questionario,
                                             "progressivo_sezione" => $sezione->progressivo_sezione]
                                            );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }

    function duplica_domanda($domanda) {
        global $con;
        $sezione = $domanda->get_sezione();
        $nuovo_progressivo_domanda = $sezione->get_prossima_domanda($id_questionario, $progressivo_sezione);
        $sql = insert_select("domande", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "descrizione", "obbligatorieta", "coeff_valutazione", "html_type", "html_pattern", "html_min", "html_max", "html_maxlenght", "rimescola"],
                                             ["progressivo_domanda" => $nuovo_progressivo_domanda],
                                             ["id_questionario" => $domanda->id_questionario,
                                             "progressivo_sezione" => $domanda->progressivo_sezione,
                                             "progressivo_domanda" => $domanda->progressivo_domanda]
                                            );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
        $this->_duplica_risposte_domanda($domanda, $nuovo_progressivo_domanda);
        return $sezione->get_domanda($nuovo_progressivo_domanda);
    }

    function _duplica_risposte_domanda($domanda, $nuovo_progressivo_domanda) {
        global $con;
        $sql = insert_select("risposte_ammesse", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "progressivo_risposta", "descrizione", "valore"],
                                                 ["progressivo_domanda" => $nuovo_progressivo_domanda],
                                                 ["id_questionario" => $domanda->id_questionario,
                                                 "progressivo_sezione" => $domanda->progressivo_sezione,
                                                 "progressivo_domanda" => $domanda->progressivo_domanda]
                                                );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }
}


?>