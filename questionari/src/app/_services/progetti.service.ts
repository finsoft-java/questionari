import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Progetto, UserRuoli } from '@/_models';

@Injectable({ providedIn: 'root' })
export class ProgettiService {
    constructor(private http: HttpClient) { }

    getProgettiUtenti(progetto: number) {
        return this.http.get<UserRuoli[]>(`${config.apiUrl}/ProgettoUtenti.php?progetto=${progetto}`);
    }
    saveProgettiUtenti(progetto: object) {
        return this.http.post(`${config.apiUrl}/ProgettoUtenti.php`, progetto);
    }
    getAll() {
        return this.http.get<Progetto[]>(`${config.apiUrl}/Progetti.php`);
    }
    getById(id: number) {
        return this.http.get(`${config.apiUrl}/Progetti.php?id_progetto=${id}`);
    }
    insert(progetto: Progetto) {
        return this.http.put(`${config.apiUrl}/Progetti.php`, progetto);
    }
    update(progetto: Progetto) {
        return this.http.post(`${config.apiUrl}/Progetti.php`, progetto);
    }
    delete(id: number) {
        return this.http.delete(`${config.apiUrl}/Progetti.php?id_progetto=${id}`);
    }
    download(id: number) {
        return this.http.get(`${config.apiUrl}/ExportReportExcel.php?id_progetto=${id}`,
            {responseType: 'arraybuffer'} );
    }
}