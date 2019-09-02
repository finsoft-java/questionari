import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, QuestionarioCompilato, VistaQuestionariCompilabili, Sezione, RispostaAmmessa, RispostaQuestionarioCompilato } from '@/_models';
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
    indice_sezione_corrente: number;    // l'indice non è per forza uguale al progressivo
    sezione_corrente: Sezione;
    is_sezione_compilata: boolean;
    loading = true;

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
      this.loading = true;
      this.questCompService.getById(this.progressivo_quest_comp)
        .subscribe(response => {
            this.questionarioCompilato = response["value"];
            this.utente_valutato_corrente = null;
            if(this.questionarioCompilato.utenti_valutati) {
                // l'utente è null per i questionari generici
                this.utente_valutato_corrente = this.questionarioCompilato.utenti_valutati[0];
            }
            this.caricaSezione(this.utente_valutato_corrente, 0);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
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
    caricaSezione(nome_utente_valutato: string, indice: number) {

        if (!this.questionarioCompilato || !this.questionarioCompilato.sezioni || indice >= this.questionarioCompilato.sezioni.length || indice < 0) {
            this.alertService.error(`La sezione ${indice} non esiste`);
            return;
        }
        this.loading = true;
        let progressivo_sezione = this.questionarioCompilato.sezioni[indice].progressivo_sezione;

        this.questCompService.getSezione(this.progressivo_quest_comp, progressivo_sezione, nome_utente_valutato)
            .subscribe(response => {
                this.indice_sezione_corrente = indice;

                this.sezione_corrente = response["value"];
                this.utente_valutato_corrente = nome_utente_valutato;
                this.indice_sezione_corrente = indice;
                this.rimescola();
                this.calc_is_sezione_compilata();
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    /**
     * Va a cercare tutte le domande che prevedono il rimescolamento, e rimescola le risposte
     */
    rimescola() {
        if (this.sezione_corrente && this.sezione_corrente.domande) {
            this.sezione_corrente.domande.forEach(domanda => {
                if (domanda.rimescola == '1' && domanda.risposte) {
                    this.shuffle(domanda.risposte);
                }
            });
        }
    }
    salvaSezione() {
        console.log("QUA");
        if (this.indice_sezione_corrente == null) {
            return;
        }
        console.log("QUA 2");
        let risposte : RispostaQuestionarioCompilato[] = [];
        this.sezione_corrente.domande.forEach(domanda => {
            risposte.push(domanda.risposta);
        });
        console.log(risposte);
        this.loading = true;
        this.questCompService.salvaRisposte(this.progressivo_quest_comp, risposte)
            .subscribe(response => {
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    sezSuccessiva() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.salvaSezione();
        this.caricaSezione(this.utente_valutato_corrente, this.indice_sezione_corrente+1);
    }
    sezPrecedente() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.salvaSezione();
        this.caricaSezione(this.utente_valutato_corrente, this.indice_sezione_corrente-1);
    }
    shuffle(array: any[]) {
        //see https://stackoverflow.com/questions/2450954

        let currentIndex = array.length, temporaryValue : any, randomIndex : number;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
    }
    calc_is_sezione_compilata() {
        let success = true;
        this.sezione_corrente.domande.forEach(domanda => {
            if (domanda.is_compilata === false) {
                success = false;
            }
        });
        this.is_sezione_compilata = success;
    }
}