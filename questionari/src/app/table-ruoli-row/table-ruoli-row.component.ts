import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { User, UserRole, UserRuoli } from '@/_models';
import { AuthenticationService, UserService, AlertService } from '@/_services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: '[table-ruoli-row]',
  templateUrl: './table-ruoli-row.component.html',
  styleUrls: ['./table-ruoli-row.component.css']
})
export class TableRuoliRowComponent implements OnInit {

  progettoUtenti: UserRuoli;
  @Input() public utente: UserRuoli; 
  @Input() public idProgetto: number;
  @Output() public itemRemoved = new EventEmitter<number>();  
  @Input() public indexUser: number;
  currentUser: User;
  currentUserSubscription: Subscription;
  utente_in_modifica: UserRuoli;

  constructor(private authenticationService: AuthenticationService,
              private userService: UserService,
              private alertService: AlertService) {
                
              this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
                  this.currentUser = user;
              });
  }
 
  ngOnInit() {
  }

  /**
   * Disattiva tutti i campi INPUT sulla riga corrente, annulla tutte le modifiche effettuate
   */
  returnFromEdit() {
    if(this.utente.editing == true) {
      this.itemRemoved.emit(this.indexUser);
    } else {
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
    if(this.utente_in_modifica.editing == true) {
      /*
      this.userService.insert(this.utente_in_modifica).subscribe(resp => {
        if (this.authenticationService.currentUserValue) { 

          this.utente_in_modifica = null;
          Object.assign(this.utente, resp["value"]); // meglio evitare this.utente = ...
          this.utente.editing = false;
        }
      },
      error => {
        this.alertService.error(error);
      });
      */
    } else {
       /*
      this.userService.update(this.utente_in_modifica).subscribe(resp => {
        if (this.authenticationService.currentUserValue) {
          this.utente_in_modifica = null;
          Object.assign(this.utente, resp["value"]); // meglio evitare this.utente = ...
          console.log("QUA", this.utente);
          this.utente.editing = false;
        }
      });
      */
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
