import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { User, UserRole, VistaQuestionariCompilabili } from '@/_models';
import { AuthenticationService, UserService, AlertService, QuestionariCompilatiService } from '@/_services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: '[table-quest-comp-row]',
  templateUrl: './table-quest-comp-row.component.html'
})
export class TableQuestCompRowComponent implements OnInit {

  @Input() public data: VistaQuestionariCompilabili; 
  @Input() public storico: boolean;
  @Output() public itemRemoved = new EventEmitter<number>();
  
  currentUser: User;
  currentUserSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService,
              private questCompService: QuestionariCompilatiService,
              private alertService: AlertService,
              private router: Router) {
                
              this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
                  this.currentUser = user;
              });
  }
 
  ngOnInit() {
  }

  creaQuestionarioCompilato() {
      this.questCompService.creaNuovo(this.data.id_progetto, this.data.id_questionario)
          .subscribe(response => {
              this.router.navigate(['/compila', response["value"].progressivo_quest_comp]);
          },
          error => {
            if (error === "OK") {
              error = "Il server ha dato una risposta non attesa, si consiglia di aggiornare la pagina.";
            }
            this.alertService.error(error);
          });

  }
  invalida() {
      this.questCompService.invalida(this.data.progressivo_quest_comp)
          .subscribe(response => {
            this.itemRemoved.emit(this.data.progressivo_quest_comp);
          },
          error => {
          this.alertService.error(error);
          });
  }

}
