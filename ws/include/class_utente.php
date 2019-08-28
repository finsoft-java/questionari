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
}



?>