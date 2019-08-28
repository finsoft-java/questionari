import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { User } from '@/_models';

@Component({
    selector: 'search',
    templateUrl: 'search-component.html'})
export class SearchComponent implements OnInit, OnDestroy {
    @Output() public doSearch = new EventEmitter<string>();
    
    searchString : string;
    previousSearch : string;
    timeout : any; // NodeJS.Timeout ?!?
    utenti_visibili : User[];

    ngOnInit() {
    }
    ngOnDestroy() {
    }
    /**
     * Se l'utente scrive "Paperino", aspettiamo mezzo secondo dall'ultima lettera
     * e poi lanciamo la ricerca una volta sola
     */
    wait_then_do_search() {
        if (this.previousSearch == this.searchString) {
            // L'utente ha schiacciato CTRL, ENTER, SHIFT, ...
            return;
        }
        this.previousSearch = this.searchString;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.timeout = null;
            this.doSearch.emit(this.searchString);
        }, 500);
    }

}