import { Input, OnInit, EventEmitter, Output, Component} from '@angular/core';
import { User, UserRole, Questionario, ProgettoQuestionari, Progetto } from '@/_models';
import { AuthenticationService, UserService, AlertService, QuestionariService } from '@/_services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: '[form-sezioni]',
  templateUrl: './form-sezioni.component.html',
  styleUrls: ['./form-sezioni.component.css']
})
export class FormSezioniComponent implements OnInit {

  @Input() public questionario: ProgettoQuestionari; 
  @Input() public progetto: Progetto;
  //usato per rimuovere la riga appena creata
  @Input() public indexQuestionario: number;
  @Output() public itemRemoved = new EventEmitter<number>();
  currentUser: User;
  currentUserSubscription: Subscription;
  questionario_in_modifica: ProgettoQuestionari;
  elenco_questionari: Questionario;
  utenti: User;
  
  tipo_questionario = ["Q. di valutazione","Q. generico"];
  constructor(private authenticationService: AuthenticationService,
              private questService: QuestionariService,              
              private userService: UserService,              
              private alertService: AlertService) {
                
              this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
                  this.currentUser = user;
              });
  }
 
  ngOnInit() {
    this.getQuestionari();
    if (this.questionario.creating) 
      this.goToEdit();
  }

  /**
   * Attiva tutti i campi INPUT sulla riga corrente
   */
  goToEdit() {
    this.questionario.editing = true;
    this.questionario_in_modifica = this.simpleClone(this.questionario);
    this.questionario_in_modifica.autovalutazione_bool = this.questionario_in_modifica.autovalutazione == '1' ? true : false; 
  }

  /**
   * Disattiva tutti i campi INPUT sulla riga corrente, annulla tutte le modifiche effettuate
   */
  returnFromEdit() {
    if(this.questionario.creating == true) {
      this.itemRemoved.emit(this.indexQuestionario);
    } else {
      this.questionario.creating = false;
      this.questionario.editing = false;    
      this.questionario_in_modifica = null;
    }
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Elimina
   */
  delete(questionario) {
    this.questService.deleteQuestionario(questionario).subscribe(resp => {
          this.itemRemoved.emit(this.indexQuestionario);
    },
    error => {
      this.alertService.error(error);
    });
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Salva
   */
  save(questionario_in_modifica) {
    //console.log("QUI", this.questionario_in_modifica.ruolo, this.ruoliMap[parseInt(this.questionario_in_modifica.ruolo)]);

    //this.questionario_in_modifica.ruolo_dec = this.ruoliMap[parseInt(this.questionario_in_modifica.ruolo)];
    if(this.controlloDatiImmessi(questionario_in_modifica)){

    //se il flg nuovo utente è settato sarà una insert altrimenti update
      questionario_in_modifica.id_progetto = this.progetto.id_progetto;
      this.questionario_in_modifica.autovalutazione = this.questionario_in_modifica.autovalutazione_bool == false ? '0' : '1';    

      if(this.questionario_in_modifica.creating == true) {
        this.questService.insertQuestionario(questionario_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) { 

            this.questionario_in_modifica = null;
            console.log(this.questionario);
            console.log(resp);
            Object.assign(this.questionario, resp["value"]); // meglio evitare this.utente = ...
            this.questionario.editing = false;
            this.questionario.creating = false;
          }
        },
        error => {
          this.alertService.error(error);
        });
      } else {
        this.questService.updQuestionario(questionario_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) {
            this.questionario_in_modifica = null;
            Object.assign(this.questionario, resp["value"]); // meglio evitare this.utente = ...
            this.questionario.editing = false;
          }
        });
      } 
    }   
  }


  controlloDatiImmessi(questionario_in_modifica){
    var error_i = 0;
    if(!questionario_in_modifica.id_questionario){
      this.alertService.error("Seleziona un Questionario");
      this.scrollToTop();
      return false;
    }
    if(!questionario_in_modifica.tipo_questionario){
      this.alertService.error("Seleziona un Tipo Questionario");
      this.scrollToTop();
      return false;
    }
    return true;
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
  truncate(value: string, limit = 25, completeWords = false, ellipsis = '...') {

    if (value.length < limit)
      return `${value.substr(0, limit)}`;
 
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
 }

 getQuestionari(): void {
  this.questService.getAll()
    .subscribe(response => {
        this.elenco_questionari = response["data"];
    },
    error => {
      this.alertService.error(error);
    });
}
getUsers(): void {
  this.userService.getAll()
    .subscribe(response => {
        this.utenti = response["data"];
    });
}
  simpleClone(obj: any) {
    return Object.assign({}, obj);
  }

}
