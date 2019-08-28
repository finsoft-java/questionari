<?php

// Prevedo le seguenti richieste:
// GET QuestionariCompilati?storico=true|false    -> restituisce la lista dei questionari compilabili oppure lo storico dei questionari compilati dall'utente
// GET QuestionariCompilati?progressivo_quest_comp=xxx&utente_valutato_corrente=aaa&sezione_corrente=bbb   -> restituisce il singolo questionario compilato
// PUT QuestionariCompilat          -> procedura di creazione del nuovo questionario, e anche di tutte le risposte
// POST QuestionariCompilati        -> serve per aggiornare lo stato del questionario (non le risposte!!!)


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
$storico = '';
$progressivo_quest_comp = '';
$utente_valutato_corrente = '';
$sezione_corrente = '';
if (isset($_GET['storico'])) {
    $storico = $con->escape_string($_GET['storico']);
} else {
    $storico = false;
}
if (isset($_GET['progressivo_quest_comp'])) {
    $progressivo_quest_comp = $con->escape_string($_GET['progressivo_quest_comp']);
}
if (isset($_GET['utente_valutato_corrente'])) {
    $utente_valutato_corrente = $con->escape_string($_GET['utente_valutato_corrente']);
}
if (isset($_GET['sezione_corrente'])) {
    $sezione_corrente = $con->escape_string($_GET['sezione_corrente']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if ($progressivo_quest_comp) {
        
        //==========================================================
        $questionario_compilato = $questionariCompilatiManager->get_questionario_compilato($progressivo_quest_comp, $utente_valutato_corrente, $sezione_corrente);
        if (!$questionario_compilato) {
            print_error(404, 'Not found');
        }
        header('Content-Type: application/json');
        echo json_encode(['value' => $questionario_compilato]);
    } else {
        //==========================================================
        $questionari = $questionariCompilatiManager->get_vista_questionari_compilabili_o_compilati($storico);
        
        header('Content-Type: application/json');
        echo json_encode(['data' => $questionari]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    //==========================================================
    
    $postdata = file_get_contents("php://input");
    $json_data = json_decode($postdata);
    if(!$json_data) {
        print_error(400, "Missing json_data");
    }
    $pq = $progettiManager->get_progetto_questionari($json_data->id_progetto, $json_data->id_questionario);
    if (!$pq) {
        print_error(404, "id_progetto e/o id_questionario errati");
    }
    $pq = $questionariCompilatiManager->get_vista_questionario_compilabile_o_compilato($json_data->id_progetto, $json_data->id_questionario);
    if (!$pq) {
        print_error(404, 'Not found');
    }
    if ($pq->stato_progetto <> '1') {
        print_error(403, "Progetto non Valido");
    }
    if ($pq->stato_questionario <> '1') {
        print_error(403, "Questionario non Valido");
    }
    
    $questionario_compilato = $questionariCompilatiManager->crea_questionario_compilato($pq);
        
    header('Content-Type: application/json');
    echo json_encode(['value' => $questionario_compilato]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //==========================================================
    
    //FIXME tutta qusta parte forse è inutile, perchè dobbiamo salvare una sezione per volta
    
    
    
    $postdata = file_get_contents("php://input");
    $json_data = json_decode($postdata);
    
    if(!$json_data) {
        print_error(400, "Missing json_data");
    }
    
    $questionario_compilato = $questionariCompilatiManager->get_questionario_compilato($progressivo_quest_comp);
    if (!$questionario_compilato) {
        print_error(404, 'Not found');
    }
    
    // L'amministratore può confermarlo oppure annullarlo
    // L'utente può solo confermare il suo lavoro
    if (utente_admin()) {
        $questionariCompilatiManager->cambia_stato($questionario_compilato, $json_data->stato);
    } else if ($questionario_compilato->utente_compilazione === $logged_user->nome_utente) {
        if ($json_data->stato == '1') {
            $questionariCompilatiManager->cambia_stato($questionario_compilato, $json_data->stato);
        } else {
            print_error(403, "L'unica modifia ammessa dall'utente è la conferma del Questionario Compilato");
        }
    } else {
        print_error(403, "Utente non autorizzato alla modifica di questo Questionario Compilato");
    }
    
} else {
    //==========================================================
    print_error(400, "Unsupported method in request: " . $_SERVER['REQUEST_METHOD']);
}


?>