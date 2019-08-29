<?php

/*
Per creare fogli Excel usiamo https://github.com/mk-j/PHP_XLSXWriter
Richiede delle estensioni PHP
in Ubuntu:
sudo apt-get install php-zip
*/


$xlsxManager = new XLSXManager();

class XLSXManager {

    /**
     * Routine principale, che genera l'intero file XLSX
     */
    function crea_file_xlsx($id_progetto, $pq) {
        $writer = new XLSXWriter();
        foreach ($pq as $progetto_questionario) {
            $this->crea_sheet_questionario($writer, $spreadsheet, $progetto_questionario);
        }
        $filename = $this->get_new_file($id_progetto);
        if (file_exists($filename)) unlink($filename);
        $writer->writeToFile($filename);
        return $filename;
    }

    /**
     * Restituisce un nome (completo) idoneo per un file XLSX.
     */
    function get_new_file($id_progetto) {
        return sys_get_temp_dir() . DIRECTORY_SEPARATOR . "ReportQuestionariProgetto-" . str_pad($id_progetto, 4, '0', STR_PAD_LEFT) . ".xlsx";
    }

    /**
     * Crea un singolo Sheet dentro il file XLSX
     * 1 sheet = 1 Questionario
     * 1 row = 1 Questionario compilato e 1 utente valutato
     */
    function crea_sheet_questionario($writer, $spreadsheet, $progetto_questionario) {
        global $questionariCompilatiManager;
        
        $titolo = $progetto_questionario->titolo_questionario;
        $domande = $progetto_questionario->get_questionario()->get_domande_appiattite();
        $header = ["" => "string", "" => "string"];
        foreach ($domande as $d) {
            $header[$d->descrizione] = "string";
        }

        $writer->writeSheetHeader($titolo, $header);

        $questionatiCompilati = $questionariCompilatiManager->get_questionari_compilati($progetto_questionario->id_progetto, $progetto_questionario->id_questionario);

        if (!$questionatiCompilati) {
            $writer->writeSheetRow($progetto_questionario->titolo, ['Questo Questionario non è mai stato compilato!']);
        } else {
            //devo comporre le righe con i nomi utenti e poi le risposte
            foreach ($questionatiCompilati as $qc) {
                $tutte_le_risposte = $qc->get_tutte_le_risposte_divise_per_utente();
                foreach($tutte_le_risposte as $utente_valutato => $risposte) {
                    $row = array_merge([$qc->utente_compilazione, $utente_valutato], array_map(function($x){return $x->get_num_o_note();}, $risposte));
                    $writer->writeSheetRow($titolo, $row);
                }
            }
        }
    }
}
