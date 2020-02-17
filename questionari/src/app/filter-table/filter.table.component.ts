import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { Pagination } from '@/_models/pagination';

@Component({
  selector: 'filter-table',
  templateUrl: './filter.table.component.html',
  styleUrls: ['./filter.table.component.css']
})
export class FilterTableComponent implements OnInit {

  @Output() filter = new EventEmitter<Pagination>();
  pagination : Pagination;
  constructor() {}
 
  ngOnInit() {
    this.pagination = new Pagination();
    this.pagination.start_item = 0;
    this.pagination.row_per_page = 10;
    this.pagination.search_string = "";
    this.searchStringFunction();
  }

  searchStringFunction(){
    this.filter.emit(this.pagination);
  }

  paginationPlusFunction(){
    this.pagination.start_item = this.pagination.start_item+this.pagination.row_per_page;
    this.filter.emit(this.pagination);
  }
  paginationMinusFunction(){
    if(this.pagination.start_item != 0){
      this.pagination.start_item = this.pagination.start_item-this.pagination.row_per_page
    }
    this.filter.emit(this.pagination);
  }
}
