import { RispostaQuestionarioCompilato } from ".";

export class Questionario {
    id_questionario: number;
    titolo: string;
    stato: string;
    stato_dec: string;
    gia_compilato: string;
    gia_compilato_dec: string;
    flag_comune: string;
    flag_comune_dec: string;
    utente_creazione: string;
    data_creazione: Date;
    sezioni?: Sezione[];
}

export class Sezione {
    id_questionario: number;
    progressivo_sezione: number;
    titolo: string;
    descrizione: string;
    domande: Domanda[];
}

export class Domanda {
    id_questionario: number;
    progressivo_sezione: number;
    progressivo_domanda: number;
    descrizione: string;
    obbligatorieta: string;
    obbligatorieta_dec: string;
    rimescola: string;
    rimescola_dec: string;
    coeff_valutazione: number;
    html_type: string;
    html_type_dec: string;
    html_pattern: string;
    html_min: string; //number oppure Date !
    html_max: string; //number oppure Date !
    html_maxlength: number;
    risposte?: RispostaAmmessa[];
    // QUesta c'è solo al momento della compilazione del questionario
    risposta?: RispostaQuestionarioCompilato;
    is_compilata?: boolean;
    editing?: boolean;
    creating?: boolean;
}

export class RispostaAmmessa {
    id_questionario: number;
    progressivo_sezione: number;
    progressivo_domanda: number;
    progressivo_risposta: number;
    descrizione: string;
    valore: number;
}

