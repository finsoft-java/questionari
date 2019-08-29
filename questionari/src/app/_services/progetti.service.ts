import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Progetto, UserRuoli } from '@/_models';

@Injectable({ providedIn: 'root' })
export class ProgettiService {
    constructor(private http: HttpClient) { }

    getProgettiUtenti(id_progetto: number) {
        return this.http.get<UserRuoli[]>(`${config.apiUrl}/ProgettoUtenti.php?progetto=${id_progetto}`);
    }
    saveProgettiUtenti(progetto: object) {
        return this.http.post(`${config.apiUrl}/ProgettoUtenti.php`, progetto);
    }
    getAll() {
        return this.http.get<Progetto[]>(`${config.apiUrl}/Progetti.php`);
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
    download(id_progetto: number) {
        return this.http.get(`${config.apiUrl}/ExportReportExcel.php?id_progetto=${id_progetto}`,
            {responseType: 'arraybuffer'} );
    }
}