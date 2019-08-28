<?php

$questionariManager = new QuestionariManager();

class Questionario {
    private $domande_appiattite;
    
    function is_gia_compilato() {
        // Attenzione assicurarsi che questa info sia stata caricata da database
        return $this->gia_compilato == '1';
    }
    
    function utente_puo_modificarlo() {
        global $logged_user;
        if ($logged_user->ruolo == '2') {
            return true;
        }
        return $this->flag_comune == '1' or $this->utente_creazione == $logged_user->nome_utente;
    }
    
    function get_sezioni() {
        if (!isset($this->sezioni)) {
            global $con;
            $arr = [];
            $sql = "SELECT * FROM sezioni WHERE id_questionario = '$this->id_questionario' ORDER BY progressivo_sezione";
            if($result = mysqli_query($con, $sql)) {
                $cr = 0;
                while($row = mysqli_fetch_assoc($result))
                {
                    $obj = new Sezione();
                    $obj->id_questionario        = $row['id_questionario'];
                    $obj->progressivo_sezione    = $row['progressivo_sezione'];
                    $obj->titolo                 = $row['titolo'];
                    $obj->descrizione            = $row['descrizione'];
                    // NON carico le domande
                    $arr[$cr++] = $obj;
                }
            } else {
                print_error(500, $con ->error);
            }
            $this->sezioni = $arr;
        }
        return $this->sezioni;
    }
    
    function get_sezione($progressivo_sezione, $explode = true) {
        global $con;
        $obj = new Sezione();
        $sql = "SELECT * FROM sezioni WHERE id_questionario = '$this->id_questionario' AND progressivo_sezione = '$progressivo_sezione'";
        
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result))
            {
                $obj->id_questionario       = $row['id_questionario'];
                $obj->progressivo_sezione   = $row['progressivo_sezione'];
                $obj->titolo                = $row['titolo'];
                $obj->descrizione           = $row['descrizione'];
                if ($explode) {
                    $obj->domande           = $obj->get_domande(true);
                }

            } else {
                return null;
            }
        } else {
            print_error(500, $con ->error);
        }
        
        return $obj;
    }

    function get_prossima_sezione() {
        global $con;
        $sql = "SELECT max(progressivo_sezione)+1 AS next FROM sezioni WHERE id_questionario = '$this->id_questionario'";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                return $row['next'];
            }
        } else {
            print_error(500, $con ->error);
        }
    }
    
    function get_domande_appiattite($explode = true) {
        if (!$this->domande_appiattite) {
            global $con;
            $arr = [];
            $sql = "SELECT * FROM domande WHERE id_questionario = '$this->id_questionario' ORDER BY progressivo_sezione, progressivo_domanda";

            if($result = mysqli_query($con, $sql)) {
                $cr = 0;
                while($row = mysqli_fetch_assoc($result))
                {
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
                    $obj->html_type             = $row['html_type'];
                    $obj->html_type_dec         = $HTML_TYPE[$row['html_type']];
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
            $this->domande_appiattite = $arr;
        }
        return $this->domande_appiattite;
    }
}

class QuestionariManager {
    
    function get_questionari() {
        global $con, $STATO_QUESTIONARIO, $BOOLEAN;
        $arr = array();
        $sql = "SELECT * FROM questionari";
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $questionario = new Questionario();
                $questionario->id_questionario        = $row['id_questionario'];
                $questionario->titolo                 = $row['titolo'];
                $questionario->stato                  = $row['stato'];
                $questionario->stato_dec              = $STATO_QUESTIONARIO[$row['stato']];
                $questionario->gia_compilato          = $row['gia_compilato'];
                $questionario->gia_compilato_dec      = $BOOLEAN[$row['gia_compilato']];
                $questionario->flag_comune            = $row['flag_comune'];
                $questionario->flag_comune_dec        = $BOOLEAN[$row['flag_comune']];
                $questionario->utente_creazione       = $row['utente_creazione'];
                $questionario->data_creazione         = $row['data_creazione'];
                $arr[$cr++] = $questionario;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_questionario($id_questionario) {
        global $con, $STATO_QUESTIONARIO, $BOOLEAN;
        $questionario = new Questionario();
        $sql = "SELECT * FROM questionari WHERE id_questionario = '$id_questionario'";
        
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result))
            {
                $questionario->id_questionario        = $row['id_questionario'];
                $questionario->titolo                 = $row['titolo'];
                $questionario->stato                  = $row['stato'];
                $questionario->stato_dec              = $STATO_QUESTIONARIO[$row['stato']];
                $questionario->gia_compilato          = $row['gia_compilato'];
                $questionario->gia_compilato_dec      = $BOOLEAN[$row['gia_compilato']];
                $questionario->flag_comune            = $row['flag_comune'];
                $questionario->flag_comune_dec        = $BOOLEAN[$row['flag_comune']];
                $questionario->utente_creazione       = $row['utente_creazione'];
                $questionario->data_creazione         = $row['data_creazione'];
                $questionario->sezioni                = $questionario->get_sezioni();    // solo la lista, non esplosa
            } else {
                print_error(404, 'Not found');
            }
        } else {
            print_error(500, $con ->error);
        }
        return $questionario;
    }
    
    function crea($json_data) {
        global $con, $logged_user;
        $sql = insert("questionari", ["id_questionario" => null,
                                  "titolo" => $json_data->titolo,
                                  "stato" => ($json_data->stato ? $json_data->stato : '0'),
                                  "flag_comune" => ($json_data->flag_comune ? $json_data->flag_comune : '0'),
                                  "gia_compilato" => '0',
                                  "utente_creazione" => $logged_user->nome_utente]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $id_questionario = mysqli_insert_id($con);
        return $this->get_questionario($id_questionario);
    }
    
    function aggiorna($questionario, $json_data) {
        global $con, $STATO_QUESTIONARIO, $BOOLEAN;
    
        $sql = update("questionari", ["titolo" => $json_data->titolo_questionario,
                                  "stato" => $json_data->stato_questionario,
                                  "flag_comune" => ($json_data->flag_comune ? $json_data->flag_comune : '0')],
                                 ["id_questionario" => $questionario->id_questionario]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        $questionario->titolo = $json_data->titolo;
        $questionario->stato = $json_data->stato;
        $questionario->stato_dec = $STATO_QUESTIONARIO[$json_data->stato];
        $questionario->flag_comune = $json_data->flag_comune;
        $questionario->flag_comune_dec = $BOOLEAN[$json_data->flag_comune];
        return $questionario;
    }
    
    function elimina($id_questionario) {
        global $con;
        $sql = "DELETE FROM questionari WHERE id_questionario = '$id_questionario'";  //on delete cascade! (FIXME funziona anche con i questionari?!?)
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        return $this;
    }
    
    function cambia_stato($questionario, $nuovo_stato) {
        global $con;
        $sql = "UPDATE questionari SET stato='$nuovo_stato' WHERE id_questionario = '$questionario->id_questionario'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $questionario->stato = $nuovo_stato;
        return $questionario;
    }

    function utente_puo_creare_questionari() {
        global $logged_user;
        return $logged_user->ruolo >= '1';
    }

    function duplica($questionario) {
        // Di fatto copio soltanto il titolo
        global $con, $logged_user, $questionariManager;
        $sql = insert_select("questionari", ["id_questionario", "stato", "flag_comune", "titolo", "utente_creazione"],
                                            ["id_questionario" => null,
                                            "stato" => '0',
                                            "flag_comune" => '0',
                                            "gia_compilato" => '0',
                                            "utente_creazione" => $logged_user->nome_utente],
                                            ["id_questionario" => $questionario->id_questionario]
                                            );
                                            //no data_creazione
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
        $nuovo_id_questionario = mysqli_insert_id($con);
        $this->_duplica_sezioni($questionario, $nuovo_id_questionario);
        $this->_duplica_domande($questionario, $nuovo_id_questionario);
        $this->_duplica_risposte($questionario, $nuovo_id_questionario);
        return $questionariManager->get_questionario($nuovo_id_questionario);
    }

    function _duplica_sezioni($questionario, $nuovo_id_questionario) {
        global $con;
        $sql = insert_select("sezioni", ["id_questionario", "progressivo_sezione", "titolo", "descrizione"],
                                        ["id_questionario" => $nuovo_id_questionario],
                                        ["id_questionario" => $questionario->id_questionario]
                                        );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }

    function _duplica_domande($questionario, $nuovo_id_questionario) {
        global $con;
        $sql = insert_select("domande", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "descrizione", "obbligatorieta", "coeff_valutazione", "html_type", "html_pattern", "html_min", "html_max", "html_maxlenght", "rimescola"],
                                        ["id_questionario" => $nuovo_id_questionario],
                                        ["id_questionario" => $questionario->id_questionario]
                                        );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }

    function _duplica_risposte($questionario, $nuovo_id_questionario) {
        global $con;
        $sql = insert_select("risposte_ammesse", ["id_questionario", "progressivo_sezione", "progressivo_domanda", "progressivo_risposta", "descrizione", "valore"],
                                                 ["id_questionario" => $nuovo_id_questionario],
                                                 ["id_questionario" => $questionario->id_questionario]
                                                 );
        mysqli_query($con, $sql);
        if ($con ->error) {
            // Tipicamente, qui potrebbe esserci un problema di concorrenza
            print_error(500, $con ->error);
        }
    }
}

?>