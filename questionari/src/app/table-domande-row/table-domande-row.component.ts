import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { User, UserRole, Questionario, ProgettoQuestionari, Progetto, Domanda, Sezione, RispostaAmmessa, RispostaQuestionarioCompilato } from '@/_models';
import { AuthenticationService, UserService, AlertService, ProgettiService, QuestionariService } from '@/_services';
import { Subscription } from 'rxjs';
import { DomandeService } from '@/_services/domande.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: '[table-domande-row]',
  templateUrl: './table-domande-row.component.html',
  styleUrls: ['./table-domande-row.component.css']
})
export class TableDomandeRowComponent implements OnInit {

  @Input() public questionario: Questionario; 
  @Input() public domanda: Domanda;
  @Input() public indexDomanda: number;

  @Output()
  public mostraRisposte = new EventEmitter<Domanda>();

  @Output() 
  public itemRemoved = new EventEmitter<number>();
  currentUser: User;
  currentUserSubscription: Subscription;
  domanda_in_modifica: Domanda;
  elenco_questionari: Questionario;
  questionatioSelezionato: Questionario;
  utenti: User;
  risposta_nuova: RispostaAmmessa;
  html_type_array = ["text","number"];
  questionari_loaded = false;
  guardaRisposte = false;
  setDisableText = false;
  setDisableNumber = false;
  public Editor = ClassicEditor;
  @Input() esisteDomandaEditing:boolean;
  @Output() public changeEditMode =  new EventEmitter<boolean>();

  constructor(private authenticationService: AuthenticationService,
              private progettiService: ProgettiService,
              private domandeService: DomandeService,
              private questionariService: QuestionariService,              
              private userService: UserService,              
              private alertService: AlertService) {
                
              this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
                  this.currentUser = user;
              });
  }
 
  ngOnInit() {
     
    this.getQuestionari();    
    this.questionatioSelezionato = this.questionario;    
    this.domanda_in_modifica = this.simpleClone(this.domanda);
    if (this.domanda.creating) 
      this.goToEdit();
    
  }

  /**
   * Attiva tutti i campi INPUT sulla riga corrente
   */
  goToEdit() {
    this.domanda.editing = true;
    this.domanda_in_modifica = this.simpleClone(this.domanda);
    this.changeEditMode.emit(true);
    this.setValidInput();
  }
  setValidInput(){
    console.log(this.domanda_in_modifica.html_type);
    if(this.domanda_in_modifica.html_type == "0"){
      this.setDisableText = true; 
      this.setDisableNumber = false; 
    }else if(this.domanda_in_modifica.html_type == "1"){
      this.setDisableText = false; 
      this.setDisableNumber = true; 
    }
  }
  removeItem(i: number) {
    this.domanda_in_modifica.risposte.splice(i, 1);
  }
  creaRisposta(){
    let risposta_nuova = new RispostaAmmessa();
    let progressivo_risposta = 1;
    this.domanda_in_modifica.risposte.forEach( r => {
        if (r.progressivo_risposta >= progressivo_risposta) {
            progressivo_risposta = 1 + parseInt(<any>r.progressivo_risposta);
        }
    });
    
    risposta_nuova.id_questionario = this.questionario.id_questionario;
    risposta_nuova.descrizione = '';
    risposta_nuova.progressivo_domanda= this.domanda_in_modifica.progressivo_domanda;
    risposta_nuova.progressivo_risposta = progressivo_risposta;
    risposta_nuova.progressivo_sezione= this.domanda_in_modifica.progressivo_sezione;
    risposta_nuova.valore = 1;
    risposta_nuova.creating = true;
    this.domanda_in_modifica.risposte.push(risposta_nuova);
}
  /**
   * Disattiva tutti i campi INPUT sulla riga corrente, annulla tutte le modifiche effettuate
   */
  returnFromEdit() {
    if(this.domanda.creating == true) {
      this.itemRemoved.emit(this.indexDomanda);
    } else {
      this.domanda.creating = false;
      this.domanda.editing = false;    
      this.domanda_in_modifica = null;
    }
    this.changeEditMode.emit(false);
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Elimina
   */
  delete() {
    this.domandeService.eliminaDomandaConRisposte(this.domanda.id_questionario, this.domanda.progressivo_sezione, this.domanda.progressivo_domanda).subscribe(resp => {
          this.itemRemoved.emit(this.indexDomanda);
    },
    error => {
      this.alertService.error(error);
    });
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Salva
   */
  newRisposta(){
    let risposta_nuova = new RispostaAmmessa();
    risposta_nuova.id_questionario = this.questionario.id_questionario;
    risposta_nuova.descrizione = '';
    risposta_nuova.progressivo_domanda= this.domanda.progressivo_domanda;
    risposta_nuova.progressivo_risposta = 0;
    risposta_nuova.valore = 1;
    this.domanda.risposte.push(risposta_nuova);
    this.guardaRisposte = true;
    this.mostraRisposte.emit(this.domanda);
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
  save() {
    //if(this.controlloDatiImmessi()){
      if(this.domanda_in_modifica.obbligatorieta == ""){
        this.domanda_in_modifica.obbligatorieta = "0";
      }
    //se il flg creating è settato sarà una insert altrimenti update
      if(this.domanda_in_modifica.creating == true) {

        this.domandeService.creaDomandaConRisposte(this.domanda_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) { 
            this.domanda_in_modifica = null;
            Object.assign(this.domanda, resp["value"]); // meglio evitare this.utente = ...
            this.domanda.editing = false;
            this.domanda.creating = false;
            this.changeEditMode.emit(false);
            this.alertService.success("Domanda inserita con successo");
            this.scrollToTop();
          }
        },
        error => {
          this.alertService.error(error);
          this.scrollToTop();
        });
      } else {
        this.domandeService.updateDomandaConRisposte(this.domanda_in_modifica).subscribe(resp => {
          if (this.authenticationService.currentUserValue) {
            this.domanda_in_modifica = null;
            Object.assign(this.domanda, resp["value"]); // meglio evitare this.utente = ...
            this.domanda.editing = false;
            this.changeEditMode.emit(false);
            this.alertService.success("Domanda modificata con successo");
            this.scrollToTop();
          }
        });
      } 
    }   
  //}

  controlloDatiImmessi(){
    /*
    if(!this.domanda_in_modifica.id_questionario){
      this.alertService.error("Seleziona un Questionario");
      this.scrollToTop();
      return false;
    }
    if(!this.domanda_in_modifica.tipo_questionario){
      this.alertService.error("Seleziona un Tipo Questionario");
      this.scrollToTop();
      return false;
    }
    if(!this.domanda_in_modifica.gruppo_compilanti){
      this.alertService.error("Seleziona un Gruppo Compilanti");
      this.scrollToTop();
      return false;
    }
    if (this.domanda_in_modifica.tipo_questionario == '0') {
      // Questionario di valutazione, c'è un campo obbligatorio in più
      if(!this.domanda_in_modifica.gruppo_valutati){
        this.alertService.error("Seleziona un Gruppo Valutati");
        this.scrollToTop();
        return false;
      }
    } else {
      // Questionario generico, ci sono 2 campi disabilitati
      this.domanda_in_modifica.gruppo_valutati = null;
      this.domanda_in_modifica.autovalutazione = '0';
      this.domanda_in_modifica.autovalutazione_bool = false;
    }
    */
    return true;
  }
  truncate(value: string, limit =15, completeWords = false, ellipsis = '...') {

    if (value.length < limit)
      return `${value.substr(0, limit)}`;
 
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
 }

 getQuestionari(): void {
  this.questionari_loaded = false;
  this.questionariService.getAll()
    .subscribe(response => {
        this.elenco_questionari = response["data"];
        this.questionari_loaded = true;
    },
    error => {
      this.alertService.error(error);
      this.questionari_loaded = true;
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


  getRisposta(){
    this.mostraRisposte.emit(this.domanda);
  }




  onChange = (_) => {};
  onTouched = () => {};

  // Form model content changed.
  writeValue(content: any): void {
    this.model = content;
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  // End ControlValueAccesor methods.

  model: any;

  config: Object = {
    charCounterCount: false
  }
}
