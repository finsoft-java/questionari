import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Questionario, Sezione, Domanda } from '@/_models';

@Injectable({ providedIn: 'root' })
export class QuestionariService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Questionario[]>(`${config.apiUrl}/Questionari.php`);
    }
    getById(id_questionario: number) {
        return this.http.get(`${config.apiUrl}/Questionari.php?id_questionario=${id_questionario}`);
    }
    insert(q: Questionario) {
        return this.http.put(`${config.apiUrl}/Questionari.php`, q);
    }
    update(q: Questionario) {
        return this.http.post(`${config.apiUrl}/Questionari.php`, q);
    }
    delete(id_questionario: number) {
        return this.http.delete(`${config.apiUrl}/Questionari.php?id_questionario=${id_questionario}`);
    }
    duplica(id_questionario: number) {
        return this.http.post(`${config.apiUrl}/CopyQuestionario.php?id_questionario=${id_questionario}`, "");
    }
    getSezioneById(id_questionario: number, progressivo_sezione: number) {
        return this.http.get(`${config.apiUrl}/Sezioni.php?id_questionario=${id_questionario}&progressivo_sezione=${progressivo_sezione}`);
    }
    updateSezione(s: Sezione) {
        return this.http.post(`${config.apiUrl}/Sezioni.php`, s);
    }
    creaSezione(s: Sezione) {
        return this.http.put(`${config.apiUrl}/Sezioni.php`, s);
    }
    duplicaSezione(id_questionario: number, progressivo_sezione: number) {
        // FIXME verificare come passare i parametri
        return this.http.post(`${config.apiUrl}/CopySezione.php?id_questionario=${id_questionario}&progressivo_sezione=${progressivo_sezione}`, '');
    }
    creaDomandaConRisposte(d: Domanda) {
        return this.http.put(`${config.apiUrl}/Domande.php`, d);
    }
    updateDomandaConRisposte(d: Domanda) {
        return this.http.post(`${config.apiUrl}/Domande.php`, d);
    }
    eliminaDomandaConRisposte(id_questionario: number, progressivo_sezione: number, progressivo_domanda: number) {
        return this.http.delete(`${config.apiUrl}/Domande.php?id_questionario=${id_questionario}&progressivo_sezione=${progressivo_sezione}&progressivo_domanda=${progressivo_domanda}`);
    }
}