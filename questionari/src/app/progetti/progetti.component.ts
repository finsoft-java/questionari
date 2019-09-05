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
    crea() {
        let newProject = new Progetto();
        newProject.stato = "0";
        newProject.titolo = "Nuovo progetto";
        newProject.gia_compilato = "0";
        newProject.utente_creazione = this.currentUser.username;
        newProject.data_creazione = new Date();        
        
        this.progettiService.insert(newProject)
            .subscribe(response => {
                let id_progetto = response["value"].id_progetto;
                this.sendMsgProgettoCreato(id_progetto);
                this.router.navigate(['/progetti', id_progetto]);
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
                    this.progetti.splice(index, 1);
                    this.calcola_progetti_visibili();
                    this.sendMsgProgettoEliminato(id_progetto);
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
                this.sendMsgProgettoCreato(p.id_progetto);
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
    sendMsgProgettoCreato(id_progetto : number) {
        let msg : Message = {
            what_has_changed: 'progetti',
            key: id_progetto,
            note: 'Creato nuovo progetto'
          }
      this.websocketsService.sendMsg(msg);
    }
    sendMsgProgettoSalvato(id_progetto : number) {
        let msg : Message = {
            what_has_changed: 'progetti',
            key: id_progetto,
            note: 'Il progetto è appena stato modificato'
          }
      this.websocketsService.sendMsg(msg);
    }
    sendMsgProgettoEliminato(id_progetto : number) {
        let msg : Message = {
            what_has_changed: 'progetti',
            key: id_progetto,
            note: 'Il progetto è appena stato eliminato'
          }
      this.websocketsService.sendMsg(msg);
    }
    onWebsocketMessage(msg : Message) {
        if (msg.what_has_changed == "progetti") {
            this.refresh();
        }
    }
}