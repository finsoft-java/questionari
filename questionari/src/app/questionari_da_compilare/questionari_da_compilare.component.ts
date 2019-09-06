import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { User, QuestionarioCompilato, VistaQuestionariCompilabili } from '@/_models';
import { AuthenticationService, QuestionariCompilatiService, AlertService, WebsocketService, Message } from '@/_services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({templateUrl: 'questionari_da_compilare.component.html'})
export class QuestionariDaCompilareComponent implements OnInit, OnDestroy {
    
    currentUserSubscription: Subscription;
    questCompSubscription: Subscription;
    websocketsSubscription: Subscription;
    currentUser: User;
    questionari: VistaQuestionariCompilabili[];
    storico: boolean;
    loading = true;
    searchString : string;
    quest_comp_visibili : VistaQuestionariCompilabili[];

    constructor(
        private authenticationService: AuthenticationService,
        private questCompService: QuestionariCompilatiService,
        private alertService: AlertService,
        private websocketsService: WebsocketService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
        this.websocketsSubscription = websocketsService.messages.subscribe(msg => { this.onWebsocketMessage(msg); });
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
        this.websocketsSubscription.unsubscribe();
    }
    getLista(): void {
        this.loading = true;
        this.questCompService.getAll(this.storico)
            .subscribe(response => {
                this.questionari = response["data"];
                this.calcola_questionari_visibili();
                this.loading = false;
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
    }
    refresh() {
        this.getLista();
    }
    removeItem(progressivoQuestComp: number) {
        let index = this.questionari.findIndex(obj => obj.progressivo_quest_comp == progressivoQuestComp);
        let q = this.questionari[index];
        this.questionari.splice(index, 1);
        this.calcola_questionari_visibili();
        this.sendMsgQuestComp(q, 'Il questionario è appena stato rimosso');
    }
    set_search_string(searchString) {
        this.searchString = searchString;
        this.calcola_questionari_visibili();
    }
    calcola_questionari_visibili() {
        if (!this.searchString) {
            this.quest_comp_visibili = this.questionari;
        } else {
            let s = this.searchString.toLowerCase();
            this.quest_comp_visibili = this.questionari.filter(q => 
                (q.titolo_progetto != null && q.titolo_progetto.toLowerCase().includes(s)) ||
                (q.titolo_questionario != null && q.titolo_questionario.toLowerCase().includes(s)) ||
                (q.stato_quest_comp_dec != null && q.stato_quest_comp_dec.toLowerCase().includes(s))
            );
        }
    }
    sendMsgQuestComp(q : QuestionarioCompilato | VistaQuestionariCompilabili, note : string) {
        let msg : Message = {
            what_has_changed: 'questionariCompilati',
            obj: q,
            note: note
          }
      this.websocketsService.sendMsg(msg);
    }
    onWebsocketMessage(msg : Message) {
        if (msg.what_has_changed == "progetti" || msg.what_has_changed == "questionari") {
            this.refresh();
        }
    }
}