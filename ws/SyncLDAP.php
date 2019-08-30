<?php

include("include/all.php");
$con = connect();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //do nothing, HTTP 200
    exit();
}

require_logged_user_JWT();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //==========================================================
    
    $count=$utenteManager->sync();
    
    echo "$count[0] utenti aggiornati, $count[1] nuovi utenti inseriti, $count[2] utenti eliminati da LDAP (ma non da qua) ";
    //FIXME propongo di aggiungere un nuovo stato valido / annullato alla tabella degli utenti
} else {
    //==========================================================
    print_error(400, "Unsupported method in request: " . $_SERVER['REQUEST_METHOD']);
}


?>