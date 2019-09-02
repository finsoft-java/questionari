import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Questionario, Sezione } from '@/_models';
import { AuthenticationService, QuestionariService, AlertService } from '@/_services';
import { ActivatedRoute } from '@angular/router';

@Component({templateUrl: 'singolo.questionario.component.html'})
export class SingoloQuestionarioComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    questSubscription: Subscription;
    currentUser: User;
    id_questionario: number;
    max_sezione: number;
    questionario: Questionario;  // con l'elenco di tutte le sezioni, ma non esplose
    sezione_corrente: Sezione; //esplosa, con tutte le domande e risposte
    indice_sezione_corrente: number;
    insert_sezione:boolean;
    stato_questionario = ["Bozza","Valido","Annullato"];
    flag_comune_select = ["No","Si"];
    nuova_sezione: Sezione;

    constructor(
        private authenticationService: AuthenticationService,
        private questionariService: QuestionariService,
        private alertService: AlertService,
        private route: ActivatedRoute
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.questSubscription = this.route.params.subscribe(params => {
            this.id_questionario = +params['id_questionario']; // (+) converts string 'id' to a number
            this.getQuestionario();
            
            
         });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
        this.questSubscription.unsubscribe();
    }
    private caricaSezione(indice: number) {
        if (!this.questionario || !this.questionario.sezioni || indice >= this.questionario.sezioni.length || indice < 0) {
            console.log(`La sezione ${indice} non esiste`);
            return;
        }
        let progressivo_sezione = this.questionario.sezioni[indice].progressivo_sezione;
        this.questionariService.getSezioneById(this.id_questionario, progressivo_sezione)
            .subscribe(response => {
                this.indice_sezione_corrente = indice;
                this.sezione_corrente = response["value"];
            },
            error => {
                this.alertService.error(error);
            });
    }
    getQuestionario(): void {
    
      this.questionariService.getById(this.id_questionario)
        .subscribe(response => {
            
            this.questionario = response["value"];
            let prog_sess = 1;
            if(this.questionario.sezioni != null){
                let prog_sess = Math.max.apply(Math, this.questionario.sezioni.map(function(o) { return o.progressivo_sezione; })) + 1;
                this.max_sezione = prog_sess;
            }
            this.nuova_sezione = {
                id_questionario: this.id_questionario,
                progressivo_sezione: prog_sess,
                titolo: "",
                descrizione: "",
                domande: []
            };
            //Ora che ho il questionario, carico la prima sezione con tutte le domande
            this.caricaSezione(0);
        },
        error => {
          this.alertService.error(error);
        });
    }
    sezSuccessiva() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.caricaSezione(this.indice_sezione_corrente+1);
    }
    sezPrecedente() {
        if (this.indice_sezione_corrente == null) {
            return;
        }
        this.caricaSezione(this.indice_sezione_corrente-1);
    }
    creaSezione() {
        if (this.questionario == null) {
            console.log("Questionario non ancora caricato, questo non dovrebbe succedere");
            return;
        }
        this.insert_sezione = true;
        this.nuova_sezione.progressivo_sezione = this.getNuovoProgressivoSezione();
    }
    getNuovoProgressivoSezione() {
        let nuovo_progr_sezione = 1;
        if(this.questionario.sezioni[0]){
            nuovo_progr_sezione = Math.max.apply(Math, this.questionario.sezioni.map(function(o) { return o.progressivo_sezione; })) + 1;
        }
        return nuovo_progr_sezione;
    }
    salvaSezione(nuova_sezione){            
        this.questionariService.creaSezione(nuova_sezione)
          .subscribe(response => {
                let nuova_sezione = response["value"];
                this.questionario.sezioni.push(nuova_sezione);
                this.indice_sezione_corrente = this.questionario.sezioni.length-1;
                this.sezione_corrente = nuova_sezione;
                this.insert_sezione = false;

                let prog_sess = Math.max.apply(Math, this.questionario.sezioni.map(function(o) { return o.progressivo_sezione; })) + 1;

                this.nuova_sezione = {
                    id_questionario: this.id_questionario,
                    progressivo_sezione: prog_sess,
                    titolo: "",
                    descrizione: "",
                    domande: []
                };
          },
          error => {
            this.alertService.error(error);
          });
    }
    duplicaSezioneCorrente() {
        if (this.sezione_corrente == null) {
            console.log("Duplico la sezione null?!? questo non dovrebbe succedere");
            return;
        }
        this.questionariService.duplicaSezione(this.sezione_corrente.id_questionario, this.sezione_corrente.progressivo_sezione)
          .subscribe(response => {
                let nuova_sezione = response["value"];
                this.questionario.sezioni.push(nuova_sezione);
                this.indice_sezione_corrente = this.questionario.sezioni.length-1;
                this.sezione_corrente = nuova_sezione;
          },
          error => {
            this.alertService.error(error);
          });
    }
    creaDomanda() {
        this.alertService.error("Non implementato");
    }
    duplicaDomanda(index: number) {
        this.alertService.error("Non implementato");
    }
    eliminaDomanda(index: number) {
        this.alertService.error("Non implementato");
    }

    updQuestionario(questionario){
        this.questionariService.update(questionario).subscribe(response => {
            let id_progetto = response["value"].id_progetto;
            //this.router.navigate(['/progetti', id_progetto]);
        },
        error => {
        this.alertService.error(error);
        });
    }
}