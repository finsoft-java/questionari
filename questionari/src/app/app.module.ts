import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AppComponent }  from './app.component';
import { routing }        from './app.routing';

import { AlertComponent } from './_components';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { LoginComponent } from './login';
import { TableUtentiRowComponent } from './table-utenti-row/table-utenti-row.component';
import { UtentiComponent } from './utenti';
import { QuestionariDaCompilareComponent } from './questionari_da_compilare';
import { QuestionariComponent } from './questionari';
import { ProgettiComponent } from './progetti';
import { SingoloProgettoComponent } from './singolo_progetto';
import { TableQuestCompRowComponent } from './table-quest-comp-row';
import { SingoloQuestionarioComponent } from './singolo_questionario';
import { CompilaQuestionarioComponent } from './compila_questionario';
import { TableQuestionariRowComponent } from './table-questionari-row/table-questionari-row.component';
import { TableRuoliRowComponent } from './table-ruoli-row';
import { SearchComponent } from './search';



@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        routing
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        UtentiComponent,
        ProgettiComponent,
        SingoloProgettoComponent,
        QuestionariComponent,
        SingoloQuestionarioComponent,
        QuestionariDaCompilareComponent,
        CompilaQuestionarioComponent,
        TableQuestCompRowComponent,
        TableUtentiRowComponent,
        TableQuestionariRowComponent,
        TableRuoliRowComponent,
        LoginComponent,
        SearchComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // provider used to create fake backend
        fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }