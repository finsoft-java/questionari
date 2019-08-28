import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User } from '@/_models';
import { UserService, AuthenticationService, AlertService } from '@/_services';

@Component({templateUrl: 'utenti.component.html'})
export class UtentiComponent implements OnInit, OnDestroy {
    currentUser: User;
    currentUserSubscription: Subscription;
    utenti : User[];
    editing : boolean = false;
    message : string;
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
        });
    }
    removeItem(index: number) {
      this.utenti.splice(index, 1);
    }
    refresh() {
        this.getUsers();
    }
    sync() {
        this.alertService.error("Non implementato");
    }

}