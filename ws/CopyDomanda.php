<?php

// In un'ottica REST, questi URL sarebbero meglio: /Questionario(123)/Sezioni(2)/Domanda(3)/Copy ma col PHP è un casino...
//
// POST CopyDomanda?id_questionario=xxx&progressivo_sezione=yyy&progressivo_domanda=zzz

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS,GET,PUT,POST,DELETE");
header("Access-Control-Allow-Headers: Authorization");

include("include/all.php");
$con = connect();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //do nothing, HTTP 200
    exit();
}

require_logged_user_JWT();

if (isset($_POST['id_questionario'])) {
    $id_questionario = $con->escape_string($_POST['id_questionario']);
}
if (isset($_POST['progressivo_sezione'])) {
    $progressivo_sezione = $con->escape_string($_POST['progressivo_sezione']);
}
if (isset($_POST['progressivo_domanda'])) {
    $progressivo_domanda = $con->escape_string($_POST['progressivo_domanda']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    if (!$id_questionario) {
        print_error(400, 'Missing id_questionario');
    }
    if (!$progressivo_sezione) {
        print_error(400, 'Missing progressivo_sezione');
    }
    if (!$progressivo_domanda) {
        print_error(400, 'Missing progressivo_domanda');
    }
    $questionario = $questionariManager->get_questionario($id_questionario);
    if (!$questionario) {
        print_error(404, 'Not found');
    }
    if (!$questionario->utente_puo_modificarlo()) {
        print_error(403, "Utente non autorizzato a modificare questo Questionario.");
    }
    if ($questionario->is_gia_compilato()) {
        print_error(403, "Questionario non modificabile perchè già compilato.");
    }
    
    $domanda = $questionario->get_sezione($progressivo_sezione)->get_domanda($progressivo_domanda);
    if (!$domanda) {
        print_error(404, 'Not found');
    }
    $nuova_domanda = $sezioniManager->duplica_domanda($domanda);
    
    header('Content-Type: application/json');
    echo json_encode(['value' => $nuova_domanda]);
    
} else {
    print_error(406, "Unsupported method: " . $_SERVER['REQUEST_METHOD']);
}

?>