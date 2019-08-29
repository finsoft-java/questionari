import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { User, UserRole, Questionario, ProgettoQuestionari, Progetto } from '@/_models';
import { AuthenticationService, UserService, AlertService, ProgettiService } from '@/_services';
import { Subscription } from 'rxjs';

@Component({
  selector: '[table-questionari-row]',
  templateUrl: './table-questionari-row.component.html',
  styleUrls: ['./table-questionari-row.component.css']
})
export class TableQuestionariRowComponent implements OnInit {

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
  //ruoliMap = ["Utente normale", "Gestore progetti", "Amministratore"];
  gruppi = ["Utente finale","Responsabile L.2","Responsabile L.1"];
  tipo_questionario = ["Q. di valutazione","Q. generico"];

  constructor(private authenticationService: AuthenticationService,
              private progettiService: ProgettiService,              
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
  delete() {
    this.progettiService.deleteProgettoQuestionario(this.questionario).subscribe(resp => {
          this.itemRemoved.emit(this.indexQuestionario);
    },
    error => {
      this.alertService.error(error);
    });
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Salva
   */
  save() {
    console.log("SAVE");
    if(this.controlloDatiImmessi()){

    //se il flg creating è settato sarà una insert altrimenti update
      this.questionario_in_modifica.id_progetto = this.progetto.id_progetto;
      this.questionario_in_modifica.autovalutazione = this.questionario_in_modifica.autovalutazione_bool == false ? '0' : '1';    

      if(this.questionario_in_modifica.creating == true) {
        this.progettiService.insertProgettoQuestionario(this.questionario_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) { 

            this.questionario_in_modifica = null;
            Object.assign(this.questionario, resp["value"]); // meglio evitare this.utente = ...
            this.questionario.editing = false;
            this.questionario.creating = false;
          }
        },
        error => {
          this.alertService.error(error);
        });
      } else {
        this.progettiService.updateProgettoQuestionario(this.questionario_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) {
            this.questionario_in_modifica = null;
            Object.assign(this.questionario, resp["value"]); // meglio evitare this.utente = ...
            this.questionario.editing = false;
          }
        });
      } 
    }   
  }

  controlloDatiImmessi(){
    console.log(this.questionario_in_modifica);
    if(!this.questionario_in_modifica.id_questionario){
      this.alertService.error("Seleziona un Questionario");
      this.scrollToTop();
      return false;
    }
    if(!this.questionario_in_modifica.tipo_questionario){
      this.alertService.error("Seleziona un Tipo Questionario");
      this.scrollToTop();
      return false;
    }
    if(!this.questionario_in_modifica.gruppo_compilanti){
      this.alertService.error("Seleziona un Gruppo Compilanti");
      this.scrollToTop();
      return false;
    }
    if (this.questionario_in_modifica.tipo_questionario == '0') {
      // Questionario di valutazione, c'è un campo obbligatorio in più
      if(!this.questionario_in_modifica.gruppo_valutati){
        this.alertService.error("Seleziona un Gruppo Valutati");
        this.scrollToTop();
        return false;
      }
    } else {
      // Questionario generico, ci sono 2 campi disabilitati
      this.questionario_in_modifica.gruppo_valutati = null;
      this.questionario_in_modifica.autovalutazione = '0';
      this.questionario_in_modifica.autovalutazione_bool = false;
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
  this.progettiService.getAll()
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
