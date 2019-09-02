﻿import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Progetto, UserRuoli, Domanda } from '@/_models';

@Injectable({ providedIn: 'root' })
export class DomandeService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Domanda[]>(`${config.apiUrl}/Domanda.php`);
    }
    getById(id_progetto: number) {
        return this.http.get(`${config.apiUrl}/Progetti.php?id_progetto=${id_progetto}`);
    }
    insert(progetto: Progetto) {
        return this.http.put(`${config.apiUrl}/Progetti.php`, progetto);
    }
    update(progetto: Progetto) {
        return this.http.post(`${config.apiUrl}/Progetti.php`, progetto);
    }
    delete(id_progetto: number) {
        return this.http.delete(`${config.apiUrl}/Progetti.php?id_progetto=${id_progetto}`);
    }
    /*
    download(id_progetto: number) {
        return this.http.get(`${config.apiUrl}/ExportReportExcel.php?id_progetto=${id_progetto}`,
            {responseType: 'arraybuffer'} );
    }
    insertProgettoQuestionario(q: ProgettoQuestionari) {
        return this.http.put(`${config.apiUrl}/ProgettoQuestionari.php`, q);
    }
    updateProgettoQuestionario(q: ProgettoQuestionari) {
        return this.http.post(`${config.apiUrl}/ProgettoQuestionari.php`, q);
    }   
    deleteProgettoQuestionario(q: ProgettoQuestionari) {
        const options = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json'
            }),
            body: q
          }
        return this.http.delete(`${config.apiUrl}/ProgettoQuestionari.php`,options);
    }
    */
}