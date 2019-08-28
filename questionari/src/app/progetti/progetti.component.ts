import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Progetto } from '@/_models';
import { AuthenticationService, ProgettiService, AlertService } from '@/_services';
import { Router } from '@angular/router';

@Component({templateUrl: 'progetti.component.html'})
export class ProgettiComponent implements OnInit, OnDestroy {
    
    currentProject: Progetto;
    currentProjectSubscription: Subscription;
    currentUserSubscription: Subscription;
    currentUser: User;
    progetti : Progetto[];

    private dataLoaded: boolean;
    private tableData: any;
    private yourMessage = [];

    constructor(
        private authenticationService: AuthenticationService,
        private progettiService: ProgettiService,
        private alertService: AlertService,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.getProgetti();
        this.dataLoaded = true;
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
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
        },
        error => {
          this.alertService.error(error);
        });
    }
    elimina(index: number): void {
        this.alertService.error("Implementato, ma per sicurezza non te lo lascio schiacciare");
        return;
        this.progettiService.delete(this.progetti[index].id_progetto)
            .subscribe(response => {
                this.progetti.splice(index, 1);
            },
            error => {
              this.alertService.error(error);
            });
    }
    duplica(index: number) {
        this.alertService.error("Non implementato");
    }
    refresh() {
        this.getProgetti();
    }
}