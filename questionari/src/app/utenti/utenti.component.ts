import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '@/_models';
import { UserService, AuthenticationService, AlertService } from '@/_services';

@Component({templateUrl: 'utenti.component.html'})
export class UtentiComponent implements OnInit, OnDestroy {
    currentUser: User;
    currentUserSubscription: Subscription;
    utenti : User[];
    editing : boolean = false;
    message : string;
    searchString : string;
    utenti_visibili : User[]; //sottoinsieme di this.utenti determinato dalla Search
    
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
        this.set_search_string(null); // altrimenti la nuova riga non è visibile
    }
    getUsers(): void {
      this.userService.getAll()
        .subscribe(response => {
            this.utenti = response["data"];
            this.calcola_utenti_visibili();
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
            this.utenti_visibili = this.utenti.filter(user => 
                (user.username != null && user.username.includes(this.searchString)) ||
                (user.cognome != null && user.cognome.includes(this.searchString)) ||
                (user.nome != null && user.nome.includes(this.searchString)) ||
                (user.email != null && user.email.includes(this.searchString))
            );
        }
    }
    removeItem(username: string) {
        let index = this.utenti.findIndex(user => user.username == username);
        this.utenti.splice(index, 1);
        this.calcola_utenti_visibili();
    }
    refresh() {
        this.getUsers();
    }
    sync() {
        this.alertService.error("Non implementato");
    }

}