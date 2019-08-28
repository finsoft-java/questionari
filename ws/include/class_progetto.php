<?php

$progettiManager = new ProgettiManager();
$progettiQuestionariManager = new ProgettiQuestionariManager();

class Progetto {
    private $progetto_utenti;
    private $progetto_questionari;
    
    function get_progetto_utenti() {
        global $progettiManager;
        if (!$this->progetto_utenti) {
            $this->progetto_utenti = $progettiManager->get_progetto_utenti($this->id_progetto);
        }
        return $this->progetto_utenti;
    }
    
    function get_progetto_questionari() {
        global $progettiManager;
        if (!$this->progetto_questionari) {
            $this->progetto_questionari = $progettiManager->get_progetto_questionari($this->id_progetto);
        }
        return $this->progetto_questionari;
    }
    
    function is_gia_compilato() {
        // Attenzione assicurarsi che questa info sia stata caricata da database
        return $this->gia_compilato == '1';
    }

    function utente_puo_modificarlo() {
        global $con, $logged_user;
        if ($logged_user->ruolo == '2') {
            return true;
        }
        $sql = "SELECT * FROM progetti_utenti WHERE id_progetto = '$this->id_progetto' AND nome_utente = '$logged_user->nome_utente' AND funzione >= '1'";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result)) {
                return true;
            } else {
                return false;
            }
        } else {
            print_error(500, $con ->error);
        }
    }
}

class ProgettoUtenti {
    private $utente;
    private $progetto;

    function get_progetto() {
        global $progettiManager;
        if (!$this->progetto) {
            $this->progetto = $progettiManager->get_progetto($this->id_progetto);
        }
        return $this->progetto;
    }
    
    function get_utente() {
        global $utentiManager;
        if (!$this->utente) {
            $this->utente = $utentiManager->get_utente($this->nome_utente);
        }
        return $this->utente;
    }
}



class ProgettoQuestionari {
    private $questionario;
    private $progetto;
    
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
}

class ProgettiManager {
    
    function get_progetti() {
        global $con, $STATO_PROGETTO, $BOOLEAN;
        $arr = array();
        $sql = "SELECT * FROM progetti";
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $progetto = new Progetto();
                $progetto->id_progetto        = $row['id_progetto'];
                $progetto->titolo             = $row['titolo'];
                $progetto->stato              = $row['stato'];
                $progetto->stato_dec          = $STATO_PROGETTO[$row['stato']];
                $progetto->gia_compilato      = $row['gia_compilato'];
                $progetto->gia_compilato_dec  = $BOOLEAN[$row['gia_compilato']];
                $progetto->utente_creazione   = $row['utente_creazione'];
                $progetto->data_creazione     = $row['data_creazione'];
                $arr[$cr++] = $progetto;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_progetto($id_progetto) {
        global $con, $STATO_PROGETTO, $BOOLEAN;
        $progetto = new Progetto();
        $sql = "SELECT * FROM progetti WHERE id_progetto = '$id_progetto'";
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result))
            {
                $progetto->id_progetto        = $row['id_progetto'];
                $progetto->titolo             = $row['titolo'];
                $progetto->stato              = $row['stato'];
                $progetto->stato_dec          = $STATO_PROGETTO[$row['stato']];
                $progetto->gia_compilato      = $row['gia_compilato'];
                $progetto->gia_compilato_dec  = $BOOLEAN[$row['gia_compilato']];
                $progetto->utente_creazione   = $row['utente_creazione'];
                $progetto->data_creazione     = $row['data_creazione'];
                $progetto->utenti             = $progetto->get_progetto_utenti();
                $progetto->questionari        = $progetto->get_progetto_questionari();
            } else {
                return null;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $progetto;
    }
    
    function crea($json_data) {
        global $con, $logged_user;
        $sql = insert("progetti", ["id_progetto" => null,
                               "titolo" => $json_data->titolo,
                               "stato" => ($json_data->stato ? $json_data->stato : '0'),
                               "gia_compilato" => '0',
                               "utente_creazione" => $logged_user->nome_utente]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $id_progetto = mysqli_insert_id($con);
        return $this->get_progetto($id_progetto);
    }
    
    function aggiorna($progetto, $json_data) {
        global $con, $STATO_PROGETTO;
        $sql = "UPDATE progetti SET titolo='$json_data->titolo', stato='$json_data->stato' WHERE id_progetto = '$progetto->id_progetto'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        /* Per i progetti/utenti faccio delete e poi insert
        $sql = "DELETE FROM progetti_utenti WHERE id_progetto = '$progetto->id_progetto'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        foreach ($json_data->utenti as $row) {
            $sql = "INSERT INTO progetti_utenti (id_progetto, nome_utente, funzione) " +
                " VALUES($row->id_progetto, $row->nome_utente, $row->funzione)";
            mysqli_query($con, $sql);
            if ($con ->error) {
                print_error(500, $con ->error);
            }
        }
        */
    }
    
    function cambia_stato($progetto, $nuovo_stato) {
        global $con, $STATO_PROGETTO;
        $sql = "UPDATE progetti SET stato='$nuovo_stato' WHERE id_progetto = '$progetto->id_progetto'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        $progetto->stato = $nuovo_stato;
        return $progetto;
    }
    
    function elimina($id_progetto) {
        global $con;
        $sql = "DELETE FROM progetti WHERE id_progetto = '$id_progetto'";  //on delete cascade! (FIXME funziona anche con i questionari?!?)
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
    }
    
    function utente_puo_creare_progetti() {
        global $logged_user;
        return $logged_user->ruolo >= '1';
    }
    
    function get_progetto_utenti($id_progetto, $funzione_or_null = null, $include_me = true) {
        global $con, $FUNZIONE, $logged_user;
        $arr = [];
        $sql = "SELECT * FROM progetti_utenti WHERE id_progetto = '$id_progetto'";
        if ($funzione_or_null) {
            $sql .= " AND funzione = '$funzione_or_null'";
        }
        if (!$include_me) {
            $sql .= " AND nome_utente <> '$logged_user->nome_utente'";
        }
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $obj = new ProgettoUtenti();
                $obj->id_progetto     = $row['id_progetto'];
                $obj->nome_utente     = $row['nome_utente'];
                $obj->funzione        = $row['funzione'];
                $obj->funzione_dec    = $FUNZIONE[$row['funzione']];
                $arr[$cr++] = $obj;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_progetto_questionari($id_progetto, $id_questionario_or_null = null) {
        global $con, $STATO_QUESTIONARIO, $GRUPPI, $TIPO_QUESTIONARIO, $BOOLEAN;
        $arr = [];
        $sql = "SELECT * FROM v_progetti_questionari WHERE id_progetto = '$id_progetto' ";
        if ($id_questionario_or_null) {
            $sql .= " AND id_questionario = '$id_questionario_or_null' ";
        }
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                if($row['gruppo_compilanti'] != ''){
                    $gruppo_compilanti = $row['gruppo_compilanti'];
                    $gruppo_compilanti_dec = $GRUPPI[$row['gruppo_compilanti']];
                }else{
                    $gruppo_compilanti = '';
                    $gruppo_compilanti_dec = '';
                }
                if($row['gruppo_valutati'] != ''){
                    $gruppo_valutati = $row['gruppo_valutati'];
                    $gruppo_valutati_dec = $GRUPPI[$row['gruppo_valutati']];
                }else{
                    $gruppo_valutati = '';
                    $gruppo_valutati_dec = '';
                }
                
                $obj = new ProgettoQuestionari();
                $obj->id_progetto            = $row['id_progetto'];
                $obj->id_questionario        = $row['id_questionario'];
                $obj->titolo_questionario    = $row['titolo_questionario'];
                $obj->stato_questionario     = $row['stato_questionario'];
                $obj->stato_questionario_dec = $STATO_QUESTIONARIO[$row['stato_questionario']];
                $obj->tipo_questionario      = $row['tipo_questionario'];
                $obj->tipo_questionario_dec  = $TIPO_QUESTIONARIO[$row['tipo_questionario']];
                $obj->gruppo_compilanti      = $gruppo_compilanti;
                $obj->gruppo_compilanti_dec  = $gruppo_compilanti_dec;
                $obj->gruppo_valutati        = $gruppo_valutati;
                $obj->gruppo_valutati_dec    = $gruppo_valutati_dec;
                $obj->autovalutazione        = $row['autovalutazione'];
                $obj->autovalutazione_dec    = $BOOLEAN[$row['autovalutazione']];
                $obj->ut_creaz_questionario  = $row['ut_creaz_questionario'];
                $obj->data_creaz_questionario= $row['data_creaz_questionario'];
                $arr[$cr++] = $obj;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_progetti_questionari_validi($id_progetto) {
        global $con, $STATO_QUESTIONARIO, $GRUPPI, $TIPO_QUESTIONARIO, $BOOLEAN;
        $arr = [];
        $sql = "SELECT * FROM v_progetti_questionari WHERE id_progetto = '$id_progetto' AND stato_questionario='1'";
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $obj = new ProgettoQuestionari();
                $obj->id_questionario        = $row['id_questionario'];
                $obj->titolo                 = $row['titolo_questionario'];
                $obj->stato                  = $row['stato_questionario'];
                $obj->stato_dec              = $STATO_QUESTIONARIO[$row['stato_questionario']];
                $obj->tipo_questionario      = $row['tipo_questionario'];
                $obj->tipo_questionario_dec  = $TIPO_QUESTIONARIO[$row['tipo_questionario']];
                $obj->gruppo_compilanti      = $row['gruppo_compilanti'];
                $obj->gruppo_compilanti_dec  = $GRUPPI[$row['gruppo_compilanti']];
                $obj->gruppo_valutati        = $row['gruppo_valutati'];
                $obj->gruppo_valutati_dec    = $GRUPPI[$row['gruppo_valutati']];
                $obj->autovalutazione        = $row['autovalutazione'];
                $obj->autovalutazione_dec    = $BOOLEAN[$row['autovalutazione']];
                $obj->utente_creazione       = $row['ut_creaz_questionario'];
                $obj->data_creazione         = $row['data_creaz_questionario'];
                $arr[$cr++] = $obj;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_utenti_funzioni($progetto){
        global $con, $RUOLO;
        $arr = array();
        $sql = "SELECT ut.username as username, pr_ut.funzione as funzione FROM utenti as ut ".
            "LEFT JOIN progetti_utenti pr_ut ON UT.username = pr_ut.nome_utente AND pr_ut.id_progetto = '".$progetto."' ".
            "ORDER BY pr_ut.funzione desc, ut.username";
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $utente = new Utente();
                $utente->nome_utente   = $row["username"];
                $utente->id_progetto = $progetto;
                $utente->responsabileL1 = false;
                $utente->responsabileL2 = false;
                $utente->utenteFinale = false;
                if($row["funzione"] != null){                    
                    switch ($row["funzione"]) {
                        case 0:
                            $utente->utenteFinale = true;
                            break;
                        case 1:
                            $utente->responsabileL2 = true;
                            break;
                        case 2:
                            $utente->responsabileL1 = true;
                            break;
                    }
                }
                $arr[$cr++] = $utente;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function save_utenti_funzioni($progetto, $lista_utenti_funzioni){
        global $con, $RUOLO;
        $sql = "DELETE FROM progetti_utenti WHERE id_progetto = '$progetto->id_progetto'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        foreach ($lista_utenti_funzioni as $row) {
            $funzione = '';
            if ($row->utenteFinale) {
                $funzione = '0';
            } elseif  ($row->responsabileL2) {
                $funzione = '1';
            } elseif  ($row->responsabileL1) {
                $funzione = '2';
            } else {
                //utente non legato al progetto
                continue;
            }
            $sql = "INSERT INTO progetti_utenti (id_progetto, nome_utente, funzione)  VALUES('".$progetto->id_progetto."', '".$row->nome_utente."', '".$funzione."')";
            mysqli_query($con, $sql);
            if ($con ->error) {
                print_error(500, $con ->error);
            }
        }
    }
}

class ProgettiQuestionariManager {
    
    function get_progetto_questionari($id_progetto, $id_questionario) {
        
        global $progettiManager;
        $pq = $progettiManager->get_progetto_questionari($id_progetto, $id_questionario);
        // $pq e' un array con 1 elemento
        if (!$pq) {
            return null;
        }
        return $pq[0];
    }
    
    function crea($json_data) {
        global $con, $logged_user;
        $sql = insert("progetti_questionari", [
                               "id_progetto" => $json_data->id_progetto,
                               "id_questionario" => $json_data->id_questionario,
                               "tipo_questionario" => $json_data->tipo_questionario,
                               "gruppo_compilanti" => $json_data->gruppo_compilanti,
                               "gruppo_valutati" => $json_data->gruppo_valutati,
                               "autovalutazione" => $json_data->autovalutazione]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        return $this->get_progetto_questionari($json_data->id_progetto, $json_data->id_questionario);
    }
    
    function aggiorna($pq, $json_data) {
        global $con, $BOOLEAN, $GRUPPI, $TIPO_QUESTIONARIO;
        $sql = update("progetti_questionari", ["tipo_questionario" => $json_data->tipo_questionario,
                                 "gruppo_compilanti" => $json_data->gruppo_compilanti,
                                 "gruppo_valutati" => $json_data->gruppo_valutati,
                                 "autovalutazione" => $json_data->autovalutazione],
                                ["id_progetto" => $pq->id_progetto,
                                "id_questionario" => $pq->id_questionario]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        if($json_data->gruppo_compilanti != ''){
            $gruppo_compilanti = $json_data->gruppo_compilanti;
            $gruppo_compilanti_dec = $GRUPPI[$json_data->gruppo_compilanti];
        }else{
            $gruppo_compilanti = '';
            $gruppo_compilanti_dec = '';
        }
        if($json_data->gruppo_valutati != ''){
            $gruppo_valutati = $json_data->gruppo_valutati;
            $gruppo_valutati_dec = $GRUPPI[$json_data->gruppo_valutati];
        }else{
            $gruppo_valutati = '';
            $gruppo_valutati_dec = '';
        }

        $pq->tipo_questionario = $json_data->tipo_questionario;
        $pq->tipo_questionario_dec = $TIPO_QUESTIONARIO[$pq->tipo_questionario];
        $pq->gruppo_compilanti = $gruppo_compilanti;
        $pq->gruppo_compilanti_dec = $gruppo_compilanti_dec;
        $pq->gruppo_valutati = $gruppo_valutati;
        $pq->gruppo_valutati_dec = $gruppo_valutati_dec;
        $pq->autovalutazione = $json_data->autovalutazione;
        $pq->autovalutazione_dec = $BOOLEAN[$pq->autovalutazione];
        return $pq;
    }
    
    function elimina($id_progetto, $id_questionario) {
        global $con;
        $sql = "DELETE FROM progetti_questionari WHERE id_progetto = '$id_progetto' and id_questionario = '$id_questionario'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
    }
}

?>