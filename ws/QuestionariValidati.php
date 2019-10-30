<?php

// Prevedo le seguenti richieste:
// GET QuestionariCompilati?storico=true|false    -> restituisce la lista dei questionari compilabili oppure lo storico dei questionari compilati dall'utente
// GET QuestionariCompilati?progressivo_quest_comp=xxx&utente_valutato_corrente=aaa&sezione_corrente=bbb   -> restituisce il singolo questionario compilato
// PUT QuestionariCompilat          -> procedura di creazione del nuovo questionario, e anche di tutte le risposte
// POST QuestionariCompilati        -> serve per aggiornare lo stato del questionario (non le risposte!!!)

include("include/all.php");
$con = connect();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //do nothing, HTTP 200
    exit();
}
require_logged_user_JWT();
if (isset($_GET['progressivo_quest_comp'])) {
    $progressivo_quest_comp = $con->escape_string($_GET['progressivo_quest_comp']);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    //==========================================================QuestionarioCompilato
    $questionario_compilato = $questionariCompilatiManager->get_domande_mancanti($progressivo_quest_comp);
    if (!$questionario_compilato) {
        print_error(404, 'Not found');
    }
    header('Content-Type: application/json');
    echo json_encode(['value' => $questionario_compilato]);
   
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    //==========================================================
    
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
} else {
    //==========================================================
    print_error(400, "Unsupported method in request: " . $_SERVER['REQUEST_METHOD']);
}


?>