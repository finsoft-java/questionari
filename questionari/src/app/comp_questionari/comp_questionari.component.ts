import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, QuestionarioCompilato, VistaQuestionariCompilabili } from '@/_models';
import { UserService, AuthenticationService, QuestionariCompilatiService } from '@/_services';

@Component({templateUrl: 'comp_questionari.component.html'})
export class CompilazioneQuestionariComponent implements OnInit, OnDestroy {
    
    currentQuestComp: QuestionarioCompilato;
    currentProjectSubscription: Subscription;
    currentUserSubscription: Subscription;
    currentUser: User;
    questionari : VistaQuestionariCompilabili[];

    private dataLoaded: boolean;
    private tableData: any;
    private yourMessage = [];

    constructor(
        private authenticationService: AuthenticationService,
        private questCompService: QuestionariCompilatiService
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.getLista();
        this.dataLoaded = true;
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
    }
    getLista(): void {
      this.questCompService.getAll(true).subscribe(response => {
          this.questionari = response["data"];
      });
    }

}