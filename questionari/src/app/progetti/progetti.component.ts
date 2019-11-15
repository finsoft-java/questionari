import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Progetto } from '@/_models';
import { AuthenticationService, ProgettiService, AlertService, WebsocketService, Message } from '@/_services';
import { Router } from '@angular/router';

@Component({templateUrl: 'progetti.component.html'})
export class ProgettiComponent implements OnInit, OnDestroy {
    
    currentProject: Progetto;
    currentUserSubscription: Subscription;
    websocketsSubscription: Subscription;
    currentUser: User;
    progetti : Progetto[];
    searchString : string;
    progetti_visibili : Progetto[];
    loading = true;

    constructor(
        private authenticationService: AuthenticationService,
        private progettiService: ProgettiService,
        private alertService: AlertService,
        private websocketsService: WebsocketService,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        this.websocketsSubscription = websocketsService.messages.subscribe(msg => { this.onWebsocketMessage(msg); });
        
    }

    ngOnInit() {
        this.getProgetti();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
        this.websocketsSubscription.unsubscribe();
    }
    addZero(i) {
        if (i < 10) {
          i = "0" + i;
        }
        return i;
      }
    crea() {
        let newProject = new Progetto();
        newProject.stato = "0";

        var d = new Date();
        var x = document.getElementById("demo");
        var h = this.addZero(d.getHours());
        var m = this.addZero(d.getMinutes());
        var s = this.addZero(d.getSeconds());

        newProject.titolo = "Nuovo progetto delle "+h + ":" + m + ":" + s;
        newProject.gia_compilato = "0";
        newProject.utente_creazione = this.currentUser.username;
        newProject.data_creazione = new Date();        
         
        this.progettiService.insert(newProject)
            .subscribe(response => {
                let p : Progetto = response["value"]; 
                this.sendMsgProgetto(p, 'Creato nuovo progetto');
                this.router.navigate(['/progetti', p.id_progetto]);
            },
            error => {
                this.alertService.error(error);
            });
    }
    getProgetti(): void {
        this.progettiService.getAll()
            .subscribe(response => {
                this.progetti = response["data"];
                this.calcola_progetti_visibili();
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    elimina(id_progetto: number): void {
        if(confirm("Stai per eliminare l'intero progetto! Procedere?")) {
            this.progettiService.delete(id_progetto)
                .subscribe(response => {
                    let index = this.progetti.findIndex(p => p.id_progetto == id_progetto);
                    let progettoOld = this.progetti[index];
                    this.progetti.splice(index, 1);
                    this.calcola_progetti_visibili();
                    this.sendMsgProgetto(progettoOld, 'Il progetto è appena stato eliminato');
                },
                error => {
                this.alertService.error(error);
                });
        }
    }
    duplica(id_questionario: number) {
        this.progettiService.duplica(id_questionario)
            .subscribe(response => {
                let p : Progetto = response["value"];
                this.progetti.push(p);
                this.calcola_progetti_visibili();
                this.sendMsgProgetto(p, 'Creato nuovo progetto');
            },
            error => {
                this.alertService.error(error);
            });
    }
    refresh() {
        this.getProgetti();
    }
    set_search_string(searchString) {
        this.searchString = searchString;
        this.calcola_progetti_visibili();
    }
    calcola_progetti_visibili() {
        if (!this.searchString) {
            this.progetti_visibili = this.progetti;
        } else {
            let s = this.searchString.toLowerCase();
            this.progetti_visibili = this.progetti.filter(p => 
                (p.titolo != null && p.titolo.toLowerCase().includes(s)) ||
                (p.utente_creazione != null && p.utente_creazione.toLowerCase().includes(s)) ||
                (p.stato_dec != null && p.stato_dec.toLowerCase().includes(s))
            );
        }
    }
    sendMsgProgetto(p : Progetto, note : string) {
        let msg : Message = {
            what_has_changed: 'progetti',
            obj: p,
            note: note
          }
      this.websocketsService.sendMsg(msg);
    }
    onWebsocketMessage(msg : Message) {
        if (msg.what_has_changed == "progetti") {
            this.refresh();
        }
    }
}