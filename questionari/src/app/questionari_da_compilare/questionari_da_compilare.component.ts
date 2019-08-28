import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, QuestionarioCompilato, VistaQuestionariCompilabili } from '@/_models';
import { UserService, AuthenticationService, QuestionariCompilatiService, AlertService } from '@/_services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({templateUrl: 'questionari_da_compilare.component.html'})
export class QuestionariDaCompilareComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    questCompSubscription: Subscription;
    currentUser: User;
    questionari: VistaQuestionariCompilabili[];
    storico: boolean;
    loading = true;

    constructor(
        private authenticationService: AuthenticationService,
        private questCompService: QuestionariCompilatiService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        
    } 

    ngOnInit() {
        this.questCompSubscription = this.route.data.subscribe(data => {
            this.storico = (data['storico'] != null && data['storico'] != '' && data['storico']);
            this.getLista();
         });
        
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.currentUserSubscription.unsubscribe();
        this.questCompSubscription.unsubscribe();
    }
    getLista(): void {
        this.loading = true;
        this.questCompService.getAll(this.storico)
            .subscribe(response => {
                this.questionari = response["data"];
                this.loading = false;
            });
    }
    removeItem(progressivoQuestComp: number) {
        let index = this.questionari.findIndex(obj => obj.progressivo_quest_comp == progressivoQuestComp);
        this.questionari.splice(index, 1);
    }
}