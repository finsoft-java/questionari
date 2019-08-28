import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User } from '@/_models';
import { UserService, AuthenticationService, AlertService } from '@/_services';
import { map } from 'rxjs/operators';

@Component({templateUrl: 'utenti.component.html'})
export class UtentiComponent implements OnInit, OnDestroy {
    currentUser: User;
    currentUserSubscription: Subscription;
    utenti : User[];
    editing : boolean = false;
    message : string;
    searchString : string;
    previousSearch : string;
    timeout : any; // NodeJS.Timeout ?!?
    utenti_visibili : User[];

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    }
    ngOnInit() {
        this.getUsers();
    }
    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
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
    }
    getUsers(): void {
      this.userService.getAll()
        .subscribe(response => {
            this.utenti = response["data"];
            this._calcola_utenti_visibili();
        });
    }
    _calcola_utenti_visibili() {
        if (!this.searchString) {
            this.utenti_visibili = this.utenti;
        } else {
            this.utenti_visibili = this.utenti.filter(user => 
                (user.username != null && user.username.includes(this.searchString)) ||
                (user.cognome != null && user.cognome.includes(this.searchString)) ||
                (user.nome != null && user.nome.includes(this.searchString)) ||
                (user.email != null && user.email.includes(this.searchString))
            );
        }
    }
    removeItem(index: number) {
      this.utenti.splice(index, 1);
      this._calcola_utenti_visibili();
    }
    refresh() {
        this.getUsers();
    }
    sync() {
        this.alertService.error("Non implementato");
    }
    /**
     * Se l'utente scrive "Paperino", aspettiamo mezzo secondo dall'ultima lettera
     * e poi lanciamo la ricerca una volta sola
     */
    wait_then_refresh($event) {
        if (this.previousSearch == this.searchString) {
            // L'utente ha schiacciato CTRL, ENTER, SHIFT, ...
            return;
        }
        this.previousSearch = this.searchString;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.timeout = null;
            this._calcola_utenti_visibili();
        }, 500);
    }

}