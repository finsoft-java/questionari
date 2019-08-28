import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { User, UserRole } from '@/_models';
import { AuthenticationService, UserService, AlertService } from '@/_services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: '[table-utenti-row]',
  templateUrl: './table-utenti-row.component.html',
  styleUrls: ['./table-utenti-row.component.css']
})
export class TableUtentiRowComponent implements OnInit {

  @Input() public utente: User; 

  //usato per rimuovere la riga appena creata
  @Input() public indexUser: number;
  @Output() public itemRemoved = new EventEmitter<number>();
  
  currentUser: User;
  currentUserSubscription: Subscription;
  utente_in_modifica: User;
  ruoliMap = ["Utente normale", "Gestore progetti", "Amministratore"];

  constructor(private authenticationService: AuthenticationService,
              private userService: UserService,
              private alertService: AlertService) {
                
              this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
                  this.currentUser = user;
              });
  }
 
  ngOnInit() {
    if (this.utente.creating) 
      this.goToEdit();
  }

  /**
   * Attiva tutti i campi INPUT sulla riga corrente
   */
  goToEdit() {
    this.utente.editing = true;
    this.utente_in_modifica = this.simpleClone(this.utente);
  }

  /**
   * Disattiva tutti i campi INPUT sulla riga corrente, annulla tutte le modifiche effettuate
   */
  returnFromEdit() {
    if(this.utente.creating == true) {
      this.itemRemoved.emit(this.indexUser);
    } else {
      this.utente.creating = false;
      this.utente.editing = false;    
      this.utente_in_modifica = null;
    }
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Elimina
   */
  delete(username: string) {
    this.userService.delete(username).subscribe(resp => {
          this.itemRemoved.emit(this.indexUser);
    },
    error => {
      this.alertService.error(error);
    });
  }

  /**
   * Richiamato dopo che l'utente ha premuto il tasto Salva
   */
  save() {
    //console.log("QUI", this.utente_in_modifica.ruolo, this.ruoliMap[parseInt(this.utente_in_modifica.ruolo)]);

    //this.utente_in_modifica.ruolo_dec = this.ruoliMap[parseInt(this.utente_in_modifica.ruolo)];

    //se il flg nuovo utente è settato sarà una insert altrimenti update
    if(this.utente_in_modifica.creating == true) {
      this.userService.insert(this.utente_in_modifica).subscribe(resp => {
        if (this.authenticationService.currentUserValue) { 

          this.utente_in_modifica = null;
          Object.assign(this.utente, resp["value"]); // meglio evitare this.utente = ...
          this.utente.editing = false;
          this.utente.creating = false;
        }
      },
      error => {
        this.alertService.error(error);
      });
    } else {
      this.userService.update(this.utente_in_modifica).subscribe(resp => {
        if (this.authenticationService.currentUserValue) {
          this.utente_in_modifica = null;
          Object.assign(this.utente, resp["value"]); // meglio evitare this.utente = ...
          this.utente.editing = false;
        }
      });
    }
    
  }

  truncate(value: string, limit = 25, completeWords = false, ellipsis = '...') {

    if (value.length < limit)
      return `${value.substr(0, limit)}`;
 
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
 }

  simpleClone(obj: any) {
    return Object.assign({}, obj);
  }

}
