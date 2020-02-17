import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { Pagination } from '@/_models/pagination';

@Component({
  selector: 'filter-table',
  templateUrl: './filter.table.component.html',
  styleUrls: ['./filter.table.component.css']
})
export class FilterTableComponent implements OnInit {

  @Output() filter = new EventEmitter<Pagination>();
  private _count : number;
  pagination : Pagination;
  numPag : number;//pagina Corrente
  numPagine: number;//pagine totali
  constructor() {}
 
  ngOnInit() {
    this.pagination = new Pagination();
    this.numPagina();
  }
  get count(): number { 
    return this._count;
  }
  
  @Input()
  set count(count: number) {
    if(count == null){
      count=0;
    }
    this._count = count;
    this.numPagina();
  }

  numPagina(){
    if(this.pagination != null){
      this.numPagine = Math.floor(this._count/this.pagination.row_per_page)+1;
      this.numPag = Math.floor(this.pagination.start_item/this.pagination.row_per_page)+1;
    }
  }

  searchStringFunction(s : string){
    this.pagination.search_string = s;
    this.pagination.start_item = 0;
    this.filter.emit(this.pagination);
  }

  paginationPlusFunction(){
    if(this.pagination.start_item+this.pagination.row_per_page < this.count){
      this.pagination.start_item = this.pagination.start_item+this.pagination.row_per_page;
      this.filter.emit(this.pagination);
    }
    this.numPagina();
  }
  paginationMinusFunction(){
    if(this.pagination.start_item != 0){
      this.pagination.start_item = this.pagination.start_item-this.pagination.row_per_page;
      this.filter.emit(this.pagination);
    }    
    this.numPagina();
    
  }
}
