<?php

$utenteManager = new UtenteManager();

class Utente {
    
}

class UtenteManager {
    
    function get_utenti() {
        global $con, $RUOLO;
        $arr = array();
        $sql = "SELECT * FROM utenti";
        
        if($result = mysqli_query($con, $sql)) {
            $cr = 0;
            while($row = mysqli_fetch_assoc($result))
            {
                $utente = new Utente();
                $utente->username   = $row["username"];
                $utente->nome       = $row['nome'];
                $utente->cognome    = $row['cognome'];
                $utente->email      = $row['email'];
                $utente->ruolo      = $row['ruolo'];
                $utente->ruolo_dec  = $RUOLO[$row['ruolo']];
                $arr[$cr++] = $utente;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $arr;
    }
    
    function get_utente($username) {
        global $con, $RUOLO;
        $utente = new Utente();
        $sql = "SELECT * FROM utenti WHERE username = '$username' ";
        
        if($result = mysqli_query($con, $sql)) {
            if($row = mysqli_fetch_assoc($result))
            {
                $utente->username   = $row['username'];
                $utente->nome       = $row['nome'];
                $utente->cognome    = $row['cognome'];
                $utente->email      = $row['email'];
                $utente->ruolo      = $row['ruolo'];
                $utente->ruolo_dec  = $RUOLO[$row['ruolo']];

            } else {
                return null;
            }
        } else {
            print_error(500, $con ->error);
        }
        return $utente;
    }
    
    function crea($json_data) {
        global $con;
        $sql = insert("utenti", ["username" => $json_data->username,
                             "nome" => $json_data->nome,
                             "cognome" => $json_data->cognome,
                             "email" => $json_data->email,
                             "ruolo" => $json_data->ruolo]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        return $this->get_utente($json_data->username);
    }
    
    function aggiorna($utente, $json_data) {
        global $con, $RUOLO;
        $sql = update("utenti", ["nome" => $json_data->nome,
                                 "cognome" => $json_data->cognome,
                                 "email" => $json_data->email,
                                 "ruolo" => $json_data->ruolo],
                                ["username" => $utente->username]);
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
        
        $utente->nome = $json_data->nome;
        $utente->cognome = $json_data->cognome;
        $utente->email = $json_data->email;
        $utente->ruolo = $json_data->ruolo;
        $utente->ruolo_dec = $RUOLO[$utente->ruolo];
        return $utente;
    }
    
    function elimina($username) {
        global $con;
        $sql = "DELETE FROM utenti WHERE username = '$username'";
        mysqli_query($con, $sql);
        if ($con ->error) {
            print_error(500, $con ->error);
        }
    }

    function get_map_utenti() {
        $utenti = $this->get_utenti();
        $map = [];
        foreach ($utenti as $u) {
            $map[$u->username] = $u;
        }
        return $map;
    }

    /**
     * Aggiorna il database in funzione degli utenti presenti su LDAP.
     * Non elimina utenti preesistenti, nel caso dà warning.
     */
    function sync() {

        $utenti_su_db_map = $this->get_map_utenti();

        $utenti_aggiornati = 0;
        $utenti_inseriti = 0;
        $utenti_eliminati_su_LDAP = 0;

        // $ldap_password = 'PASSWORD';
        // $ldap_username = 'USERNAME@DOMAIN';
        $ldap_connection = ldap_connect(AD_SERVER);
        if (FALSE === $ldap_connection){
            // Uh-oh, something is wrong...
        }

        // We have to set this option for the version of Active Directory we are using.
        ldap_set_option($ldap_connection, LDAP_OPT_PROTOCOL_VERSION, 3) or die('Unable to set LDAP protocol version');
        ldap_set_option($ldap_connection, LDAP_OPT_REFERRALS, 0); // We need this for doing an LDAP search.

        if (TRUE === ldap_bind($ldap_connection, $ldap_username, $ldap_password)){
            $ldap_base_dn = AD_BASE_DN;
            $search_filter = AD_FILTER;
            $attributes = array();
            $attributes[] = 'givenname';
            $attributes[] = 'mail';
            $attributes[] = 'samaccountname';
            $attributes[] = 'sn';
            $result = ldap_search($ldap_connection, $ldap_base_dn, $search_filter, $attributes);
            if (FALSE !== $result){
                $entries = ldap_get_entries($ldap_connection, $result);
                for ($x=0; $x < $entries['count']; $x++){
                    if (array_has_key($utenti_map, $entries['samaccountname'])) {
                        // UPDATE
                        $u = $utenti_map[$entries['samaccountname']];
                        $u->nome = $entries['givenname'];
                        $u->cognome = $entries['givenname']; //?!? FIXME
                        $u->email = $entries['mail'];
                        $this->aggiorna($u, $u);
                        ++$utenti_aggiornati;
                    } else {
                        // INSERT
                        $u = new Utente();
                        $u->username = $entries['samaccountname'];
                        $u->nome = $entries['givenname'];
                        $u->cognome = $entries['givenname']; //?!? FIXME
                        $u->email = $entries['mail'];
                        $u->ruolo = '0';
                        $this->crea($u);
                        ++$utenti_inseriti;
                    }
                }
            }
            ldap_unbind($ldap_connection); // Clean up after ourselves.
        }

        $utenti_eliminati_su_LDAP = count($utenti_su_db_map) - $utenti_aggiornati;

        return [$utenti_aggiornati, $utenti_inseriti, $utenti_eliminati_su_LDAP];
    }
}



?>