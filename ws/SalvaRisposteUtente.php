<?php

//
// Prevedo le seguenti richieste:
// POST SalvaRisposteUtente?progressivo_quest_comp=xxx

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

if (isset($_GET['progressivo_quest_comp'])) {
    $progressivo_quest_comp = $con->escape_string($_GET['progressivo_quest_comp']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //==========================================================
    
    if (!$progressivo_quest_comp) {
        print_error(400, "Missing progressivo_quest_comp");
    }
    
    $postdata = file_get_contents("php://input");
    $json_data_array = json_decode($postdata);
    if (!$json_data_array) {
        print_error(400, "Missing JSON data");
    }
    $questionario_compilato = $questionariCompilatiManager->get_questionario_compilato($progressivo_quest_comp);
    if ($questionario_compilato->utente_compilazione !== $logged_user->nome_utente) {
        print_error(403, "Utente non autorizzato a compilare questo Questionario.");
    }
    if ($questionario_compilato->stato <> '1') {
        print_error(403, "Il Questionario Compilato non è in stato Valido.");
    }
    if ($questionario_compilato->get_questionario()->stato <> '1') {
        print_error(403, "Il Questionario non è in stato Valido.");
    }
    if (!is_array($json_data_array)) {
        print_error(403, "Era atteso un Array di risposte.");
    }
    for ($json_data_array as $json_data) {
        if ($json_data->progressivo_quest_comp != $progressivo_quest_comp) {
            print_error(403, "Era atteso un Array di risposte del Questionario Compilato $questionario_compilato->progressivo_quest_comp non $json_data->progressivo_quest_comp.");
        }
    }
    $questionariCompilatiManager->update_risposte($json_data_array);
    
} else {
    //==========================================================
    print_error(400, "Unsupported method in request: " . $_SERVER['REQUEST_METHOD']);
}

?>