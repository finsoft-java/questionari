﻿import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '@/_models';
import { UserService, AuthenticationService, AlertService, WebsocketService, Message } from '@/_services';

@Component({templateUrl: 'utenti.component.html'})
export class UtentiComponent implements OnInit, OnDestroy {
    currentUser: User;
    currentUserSubscription: Subscription;
    websocketsSubscription: Subscription;
    utenti : User[];
    editing : boolean = false;
    message : string;
    searchString : string;
    utenti_visibili : User[]; //sottoinsieme di this.utenti determinato dalla Search
    loading = true;
    
    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService,
        private websocketsService: WebsocketService
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        this.websocketsSubscription = websocketsService.messages.subscribe(msg => { this.onWebsocketMessage(msg); });
        
    }
    ngOnInit() {
        this.getUsers();
    }
    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.websocketsSubscription.unsubscribe();
        this.currentUserSubscription.unsubscribe();
    }
    newUser() {
        let userNew = new User();
        userNew.nome = "";
        userNew.cognome = "";
        userNew.email = "";
        userNew.username = "";
        userNew.ruolo = "0";
        userNew.editing = true;
        userNew.creating = true;
        this.utenti.push(userNew);
        this.set_search_string(null); // altrimenti la nuova riga non è visibile
    }
    getUsers(): void {
        this.loading = true;
        this.userService.getAll()
            .subscribe(response => {
                this.utenti = response["data"];
                this.calcola_utenti_visibili();
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    set_search_string(searchString) {
        this.searchString = searchString;
        this.calcola_utenti_visibili();
    }
    calcola_utenti_visibili() {
        if (!this.searchString) {
            this.utenti_visibili = this.utenti;
        } else {
            let s = this.searchString.toLowerCase();
            this.utenti_visibili = this.utenti.filter(user => 
                (user.username != null && user.username.toLowerCase().includes(s)) ||
                (user.cognome != null && user.cognome.toLowerCase().includes(s)) ||
                (user.nome != null && user.nome.toLowerCase().includes(s)) ||
                (user.email != null && user.email.toLowerCase().includes(s))
            );
        }
    }
    removeItem(username: string) {
        let index = this.utenti.findIndex(user => user.username == username);
        let oldUtente = this.utenti[index];
        this.utenti.splice(index, 1);
        this.calcola_utenti_visibili();
        this.sendMsgUtenti(oldUtente, 'L\'utente è appena stato eliminato');
    }
    refresh() {
        this.getUsers();
    }
    sync() {
        this.loading = true;
        this.userService.sync()
            .subscribe(response => {
                this.alertService.success(response["msg"]);
                this.getUsers();
                this.sendMsgUtenti(null, 'E\' appena stato eseguito un Sync con il server LDAP');
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    sendMsgUtenti(user : User, message : string) {
        let msg : Message = {
            what_has_changed: 'utenti',
            obj: user,
            note: message
          }
      this.websocketsService.sendMsg(msg);
    }
    onWebsocketMessage(msg : Message) {
        if (msg.what_has_changed == "utenti") {
            let utenteMod = <User>msg.obj;
            let username = utenteMod.username;
            if (username) {
                let utente = this.utenti.find(u => u.username == username);
                if (utente) {
                    if (utente.editing === true) {
                        this.alertService.error(`Attenzione! La riga '${username}' è appena stata modificata da un altro utente.`);
                        Object.assign(utente, utenteMod);
                        utente.editing = false;
                    }
                }
            }
        }
    }

}