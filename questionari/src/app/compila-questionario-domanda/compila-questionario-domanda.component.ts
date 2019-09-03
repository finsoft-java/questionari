import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { Domanda, Sezione } from '@/_models';
import { AuthenticationService, UserService, AlertService, QuestionariCompilatiService } from '@/_services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: '[compila-questionario-domanda]',
  templateUrl: './compila-questionario-domanda.component.html'
})
export class CompilaQuestionarioDomandaComponent implements OnInit {
  
  @Input() domanda : Domanda; //deve includere tutte le domande e tutte le risposte
  @Input()  questionario_modificabile : boolean;

  @Output() compiled = new EventEmitter<void>();
  
  is_domanda_aperta = false;
  is_domanda_compilata = false;

  constructor(
      private authenticationService: AuthenticationService,
      private questCompService: QuestionariCompilatiService,
      private alertService: AlertService,
      private route: ActivatedRoute,
      private router: Router
  ) {
      }
  
  ngOnInit(): void {
    this.calc_flags();
  }
  calc_flags() {
    this.is_domanda_aperta = (this.domanda.risposte == null || this.domanda.risposte.length == 0);

    let compilata = true;
      
      if (this.domanda.obbligatorieta == '1') {
          if (this.is_domanda_aperta) {
            if (!this.domanda.risposta.risposta_aperta) {
              compilata = false;
            }
          } else {
            if (!this.domanda.risposta.progressivo_risposta) {
              compilata = false;
            }
          }
      }
      
      this.domanda.is_compilata = compilata;
      
      this.compiled.emit();
  }

}
