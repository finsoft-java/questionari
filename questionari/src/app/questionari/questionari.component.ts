import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Questionario } from '@/_models';
import { AuthenticationService, QuestionariService, AlertService } from '@/_services';
import { Router } from '@angular/router';

@Component({templateUrl: 'questionari.component.html'})
export class QuestionariComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    currentUser: User;
    questionari : Questionario[];
    constructor(
        private authenticationService: AuthenticationService,
        private questionariService: QuestionariService,
        private alertService: AlertService,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.getQuestionari();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
    }
    crea() {
        let newQuest = new Questionario();
        newQuest.stato = "0";
        newQuest.titolo = "Nuovo questionario";
        newQuest.flag_comune = "0";
        newQuest.gia_compilato = "0";
        newQuest.utente_creazione = this.currentUser.username;
        newQuest.data_creazione = new Date();
        this.questionariService.insert(newQuest)
            .subscribe(response => {
                let id_questionario = response["value"].id_questionario;
                this.router.navigate(['/questionari', id_questionario]);
            },
            error => {
            this.alertService.error(error);
            });
    }
    getQuestionari(): void {
      this.questionariService.getAll()
        .subscribe(response => {
            this.questionari = response["data"];
        },
        error => {
          this.alertService.error(error);
        });
    }
    elimina(index: number): void {
        this.alertService.error("Implementato, ma per sicurezza non te lo lascio schiacciare");
        return;
        this.questionariService.delete(this.questionari[index].id_questionario)
            .subscribe(response => {
                this.questionari.splice(index, 1);
            },
            error => {
              this.alertService.error(error);
            });
    }
    duplica(index: number) {
        this.alertService.error("Non implementato");
    }
    refresh() {
        this.getQuestionari();
    }
}