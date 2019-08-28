<?php

// Prevedo le seguenti richieste:
// OPTIONS
// GET User  -> lista di tutti gli utenti
// GET User?username=xxx  -> singolo utente
// PUT User -> creazione nuovo utente
// POST User -> update utente esistente
// DELETE User?username=xxx -> elimina utente esistente

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE");
header("Access-Control-Allow-Headers: *");

include("include/all.php");    
$con = connect();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //do nothing, HTTP 200
    exit();
}
    
require_logged_user_JWT();

$username = '';
if (isset($_GET['username'])) {
    $username = $con->escape_string($_GET['username']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if ($username) {
        
        //==========================================================
        $utente = $utenteManager->get_utente($username);
        if (!$utente) {
            print_error(404, 'Not found');
        }
        header('Content-Type: application/json');
        echo json_encode(['value' => $utente]);
    } else {
        //==========================================================
        $utenti = $utenteManager->get_utenti();
          
        header('Content-Type: application/json');
        echo json_encode(['data' => $utenti]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    //==========================================================
    $postdata = file_get_contents("php://input");
    $json_data = json_decode($postdata);
    if (!$json_data) {
        print_error(400, "Missing JSON data");
    }
    
    if (!utente_admin()) {
        print_error(403, "Solo gli Amministratori possono modificare la tabella Utenti.");
    }
    $utente = $utenteManager->crea($json_data);
    
    header('Content-Type: application/json');
    echo json_encode(['value' => $utente]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //==========================================================
    $postdata = file_get_contents("php://input");
    $json_data = json_decode($postdata);
    if (!$json_data) {
        print_error(400, "Missing JSON data");
    }
    if (!utente_admin()) {
        print_error(403, "Solo gli Amministratori possono modificare la tabella Utenti.");
    }
    $utente = $utenteManager->get_utente($json_data->username);
    if (!$utente) {
        print_error(404, 'Not found');
    }
    $utenteManager->aggiorna($utente, $json_data);
    
    header('Content-Type: application/json');
    echo json_encode(['value' => $utente]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    //==========================================================
    if (!$username) {
        print_error(400, 'Missing username');
    }
    if (!utente_admin()) {
        print_error(403, "Solo gli Amministratori possono modificare la tabella Utenti.");
    }
    $utenteManager->elimina($username);
    
} else {
    //==========================================================
    print_error(400, "Unsupported method in request: " . $_SERVER['REQUEST_METHOD']);
}

?>