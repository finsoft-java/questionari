import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Questionario, Sezione } from '@/_models';

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

    insertQuestionario(q: Questionario) {
        return this.http.put(`${config.apiUrl}/ProgettoQuestionari.php`, q);
    }
    updQuestionario(q: Questionario) {
        return this.http.post(`${config.apiUrl}/ProgettoQuestionari.php`, q);
    }   
    deleteQuestionario(questionario) {
        const options = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            }),
            body: questionario
          }
        return this.http.delete(`${config.apiUrl}/ProgettoQuestionari.php`,options);
    }
    update(q: Questionario) {
        return this.http.post(`${config.apiUrl}/Questionari.php`, q);
    }
    delete(id_questionario: number) {
        return this.http.delete(`${config.apiUrl}/Questionari.php?id_questionario=${id_questionario}`);
    }
    duplica(id_questionario: number) {
        // FIXME verificare come passare i parametri
        return this.http.post(`${config.apiUrl}/CopyQuestionario.php?id_questionario=${id_questionario}`, "");
    }
    getSezioneById(id_questionario: number, progressivo_sezione: number) {
        return this.http.get(`${config.apiUrl}/Sezioni.php?id_questionario=${id_questionario}&progressivo_sezione=${progressivo_sezione}`);
    }
    updateSezione(s: Sezione) {
        return this.http.post(`${config.apiUrl}/Sezioni.php`, s);
    }
    creaSezione(id_questionario: number) {
        let s = new Sezione();
        s.id_questionario = id_questionario;
        s.progressivo_sezione = null; // lo setta il server        s.titolo = "Nuova sezione";
        s.descrizione = "";
        return this.http.put(`${config.apiUrl}/Sezioni.php`, s);
    }
    duplicaSezione(s: Sezione) {
        // FIXME verificare come passare i parametri
        return this.http.post(`${config.apiUrl}/CopySezione.php`, s);
    }
}