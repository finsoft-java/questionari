<?php

/*
Per creare fogli Excel usiamo https://github.com/mk-j/PHP_XLSXWriter
Richiede delle estensioni PHP
in Ubuntu:
sudo apt-get install php-zip
*/
include("include/all.php");
$con = connect();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    //do nothing, HTTP 200
    exit();
}

require_logged_user_JWT();

if (isset($_GET['id_progetto'])) {
    $id_progetto = $con->escape_string($_GET['id_progetto']);
} else {
    print_error(400, "Missing id_progetto");
}

if (!$progettiManager->get_progetto($id_progetto)->utente_puo_modificarlo()) {
    print_error(403, "Utente non abilitato alla stampa del Progetto");
}

$pq = $progettiManager->get_progetti_questionari_validi($id_progetto);
if (!$pq) {
    print_error(404, "Questo Progetto non ha Questionari Validi associati");
}

$file = get_new_file($id_progetto);
$writer = new XLSXWriter();

foreach ($pq as $progetto_questionario) {
    crea_sheet_questionario($writer, $spreadsheet, $progetto_questionario);
}

$writer->writeToFile($file);


header('Content-Description: File Transfer');
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename='.basename($file));
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($file));
ob_clean();
flush();
readfile($file);

// ====================================================================

function get_new_file($id_progetto) {
    $file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "ReportQuestionariProgetto-" . str_pad($id_progetto, 4, '0', STR_PAD_LEFT) . ".xlsx";
    if (file_exists($file)) unlink($file);
    return $file;
}

function crea_sheet_questionario($writer, $spreadsheet, $progetto_questionario) {
    global $questionariCompilatiManager;
    
    $titolo = $progetto_questionario->titolo_questionario;
    $domande = $progetto_questionario->get_questionario()->get_domande_appiattite();
    $header = array_merge(["", ""], array_map(function($x){return $x->descrizione;}, $domande));
    
    $writer->writeSheetHeader($titolo, $header);
    
    $questionatiCompilati = $questionariCompilatiManager->get_questionari_compilati($progetto_questionario->id_progetto, $progetto_questionario->id_questionario);
    if (!$questionatiCompilati){
        $writer->writeSheetRow($progetto_questionario->titolo, ['Questo Questionario non è mai stato compilato!']);
    } else {
        //devo comporre le righe con i nomi utenti e poi le risposte
        foreach ($questionatiCompilati as $qc) {
            $tutte_le_risposte = $qc->get_tutte_le_risposte_divise_per_utente();
            foreach($tutte_le_risposte as $utente_valutato => $risposte) {
                $row = array_merge([$qc->utente_compilazione, $utente_valutato], array_map(function($x){return $x->get_num_o_note();}, $risposte));
                $writer->writeSheetRow($progetto_questionario->titolo, $row);
            }
        }
    }
}



?>