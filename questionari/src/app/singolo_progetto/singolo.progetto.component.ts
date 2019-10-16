import { Component, OnInit, OnDestroy, Output, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, Progetto, ProgettoQuestionari, UserRuoli } from '@/_models';
import { AuthenticationService, ProgettiService, AlertService, UserService } from '@/_services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({templateUrl: 'singolo.progetto.component.html'})
export class SingoloProgettoComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    projectSubscription: Subscription;
    currentUser: User;
    progettoUtenti: UserRuoli[];
    id_progetto: number;
    progetto: Progetto;
    utenti: User [];
    inserimento_utente:any;
    resp_primo_livello: Array<String> = [];
    resp_secondo_livello: Array<String> = [];
    utenti_finali: Array<String> = [];
    @Input() stato_modifica: Object;
    success_mex:any ='';
    utentiSelect: number[];
    l1: User []= [];
    l2: User []= [];
    uf: User []= [];

    stato_progetto = ["Bozza","Valido","Annullato","Completato"];
    constructor(
        private authenticationService: AuthenticationService,
        private progettiService: ProgettiService,
        private alertService: AlertService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    } 

    ngOnInit() {
        this.getUsers();
        this.progettoUtenti;
        this.projectSubscription = this.route.params.subscribe(params => {
            this.id_progetto = +params['id_progetto']; 
            this.getProgetto();
            this.getUtentiRuoli();
         },
         error => {
           this.alertService.error(error);
         });
    }
    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
        this.projectSubscription.unsubscribe();
    }
    getProgetto(): void {
      this.progettiService.getById(this.id_progetto)
        .subscribe(response => {
            this.progetto = response["value"];
            this.stato_modifica = this.progetto.stato;
            for(var i = 0;i < this.progetto.utenti.length; i++ ){
                var aa = this.progetto.utenti[i];
                if(this.progetto.utenti[i].funzione == "0"){
                    this.utenti_finali.push(this.progetto.utenti[i].nome_utente);
                    this.utenti.splice(aa.id_progetto, 1);
                }
                if(this.progetto.utenti[i].funzione == "1"){
                    this.resp_primo_livello.push(this.progetto.utenti[i].nome_utente);
                    this.utenti.splice(aa.id_progetto, 1);
                }
                if(this.progetto.utenti[i].funzione == "2"){
                    this.resp_secondo_livello.push(this.progetto.utenti[i].nome_utente);
                    this.utenti.splice(aa.id_progetto, 1);
                }
            }            
        },
        error => {
          this.alertService.error(error);
        });
    }
    scrollToTop(){
        let scrollToTop = window.setInterval(() => {
            let pos = window.pageYOffset;
            if (pos > 0) {
                window.scrollTo(0, pos - 20); // how far to scroll on each step
            } else {
                window.clearInterval(scrollToTop);
            }
        }, 16);
    }
    save(utenti){
        this.progettiService.saveProgettiUtenti(utenti).subscribe(response => {
            
            this.success_mex = "Utenti Progetto modificati con successo";
        },
        error => {
            this.success_mex = '';
          this.alertService.error(error);
        });
    }
    updProgetto(){        
        this.progettiService.update(this.progetto).subscribe(response => {
                let id_progetto = response["value"].id_progetto;
                //this.router.navigate(['/progetti', id_progetto]);
                this.alertService.success("Progetto modificato con successo");
                //this.scrollToTop();
            },
            error => {
                this.alertService.error(error);
            });
    }
    download(): void {
        this.progettiService.download(this.id_progetto)
            .subscribe(response => {
                this.downLoadFile(response, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", `Report-${this.id_progetto}.xlsx`)
            },
            error => {
              this.alertService.error(error);
            });
    }
    selectedUser(type_select){
        if(this.inserimento_utente != ''){
            if(type_select == 'resp_primo_livello'){
                this.resp_primo_livello.push(this.inserimento_utente);
            }else if(type_select == 'resp_secondo_livello'){
                this.resp_secondo_livello.push(this.inserimento_utente);
            }else{
                this.utenti_finali.push(this.inserimento_utente);
            }
            this.utenti.splice(this.inserimento_utente, 1);
        }
        this.inserimento_utente = '';
    }

    /**
     * Method is use to download file.
     * @param data - Array Buffer data
     * @param type - type of the document.
     */
    private downLoadFile(data: any, type: string, filename: string) {
        let blob = new Blob([data], { type: type});
        let url = window.URL.createObjectURL(blob);

        // Now, you could just do: window.open(url);
        // However, the filename generated is horrible
        // We want force the name of the downloaded file
        let fileLink = document.createElement('a');
        fileLink.href = url;
        fileLink.download = filename;
        fileLink.click();
    }
    newQuestionario(){
        let questionarioNew = new ProgettoQuestionari();
        questionarioNew.autovalutazione = "";
        questionarioNew.gruppo_compilanti = "";
        questionarioNew.gruppo_valutati = "";
        questionarioNew.creating = true;
        questionarioNew.editing = true;
        this.progetto.questionari.push(questionarioNew);
    }

    refresh(){
        this.getUtentiRuoli();
    }
    refreshQuestionario(){
        this.getProgetto();
    }
    
    getUsers(): void {
        this.userService.getAll()
        .subscribe(response => {
            this.utenti = response["data"];
        });
    }
    removeItem(index: number) {
        this.progetto.questionari.splice(index, 1);
    
    }
    getUtentiRuoli(){
        this.progettiService.getProgettiUtenti(this.id_progetto).subscribe(resp => {
            this.progettoUtenti = resp["data"];
        });
    }
    completa(){
        this.progetto.stato = '3';
        this.updProgetto();
    }
    riapri(){
        this.progetto.stato = '1';
        this.updProgetto();
    }
    changeSelect(a){
        console.log(a);
    }
    goToSelect(livello){
        if(livello == 'l1'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].responsabileL1 = true;
            }
        }else if(livello == 'l2'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].responsabileL2 = true;
            }
        }else if(livello == 'uf'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].utenteFinale = true;
            }
        }
        this.save(this.progettoUtenti);

    }
    returnToSelect(livello){
        if(livello == 'l1'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].responsabileL1 = false;
            }
        }else if(livello == 'l2'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].responsabileL2 = false;
            }
        }else if(livello == 'uf'){
            for(let i = 0; i < this.utentiSelect.length; i++){
                this.progettoUtenti[this.utentiSelect[i]].utenteFinale = false;
            }
        }
        this.save(this.progettoUtenti);
    }
}