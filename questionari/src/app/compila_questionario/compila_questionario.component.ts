import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, QuestionarioCompilato, VistaQuestionariCompilabili, Sezione, RispostaAmmessa } from '@/_models';
import { UserService, AuthenticationService, QuestionariCompilatiService, AlertService } from '@/_services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({templateUrl: 'compila_questionario.component.html'})
export class CompilaQuestionarioComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    questSubscription: Subscription;
    currentUser: User;
    questionarioCompilato: QuestionarioCompilato;
    progressivo_quest_comp: number;
    
    utente_valutato_corrente: string;
    indice_sezione_corrente: number;
    sezione_corrente: Sezione;
    risposte_sez_corrente: RispostaAmmessa[];

    constructor(
        private authenticationService: AuthenticationService,
        private questCompService: QuestionariCompilatiService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.questSubscription = this.route.params.subscribe(params => {
            this.progressivo_quest_comp = +params['progressivo_quest_comp']; // (+) converts string 'id' to a number
            this.getQuestionarioCompilato();
         });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
        this.questSubscription.unsubscribe();
    }
    getQuestionarioCompilato(): void {
      this.questCompService.getById(this.progressivo_quest_comp)
        .subscribe(response => {
            this.questionarioCompilato = response["value"];

            //Per semplicità, mi faccio restituire tutto dallo stesso servizio, ma forse non è una buona idea
            this.utente_valutato_corrente = this.questionarioCompilato.utente_valutato_corrente;
            this.sezione_corrente = this.questionarioCompilato.sezione_corrente; // ogni domanda include risposta_dell_utente

            // ora devo calcolarmi l'indice...
            this.indice_sezione_corrente = this.questionarioCompilato.sezioni
                .findIndex(s => s.progressivo_sezione == this.sezione_corrente.progressivo_sezione);
        },
        error => {
          this.alertService.error(error);
        });
    }
    convalida() {
        this.questCompService.convalida(this.progressivo_quest_comp)
            .subscribe(response => {
                this.router.navigate(['/questionari_compilati']);
            },
            error => {
            this.alertService.error(error);
            });
    }
    private caricaSezione(nome_utente_valutato: string, indice: number) {

        if (!this.questionarioCompilato || !this.questionarioCompilato.sezioni || indice >= this.questionarioCompilato.sezioni.length || indice < 0) {
            console.log(`La sezione ${indice} non esiste`);
            return;
        }
        let progressivo_sezione = this.questionarioCompilato.sezioni[indice].progressivo_sezione;

        this.questCompService.getById(this.progressivo_quest_comp, nome_utente_valutato, progressivo_sezione)
            .subscribe(response => {
                this.indice_sezione_corrente = indice;

                let quest: QuestionarioCompilato = response["value"];
                this.sezione_corrente = quest.sezione_corrente; // ogni domanda include risposta_dell_utente
                this.utente_valutato_corrente = nome_utente_valutato;
                this.indice_sezione_corrente = indice;
            },
            error => {
                this.alertService.error(error);
            });
    }
    sezSuccessiva() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.caricaSezione(this.utente_valutato_corrente, this.indice_sezione_corrente+1);
    }
    sezPrecedente() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.caricaSezione(this.utente_valutato_corrente, this.indice_sezione_corrente-1);
    }

}