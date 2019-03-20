import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-define',
  templateUrl: './input-define.component.html',
  styleUrls: ['./input-define.component.scss']
})
export class InputDefineComponent implements OnInit {

  static ROWS_COUNT = 20;
  page: number;
  defineData: any[];
  defineColums: any[];
  rowHeaders: any[];

  constructor(private input: InputDataService) {

    this.page = 1;
    this.defineData = new Array();
    this.defineColums = new Array();
    this.rowHeaders = new Array();

    for (var i = 1; i <= InputDataService.DEFINE_CASE_COUNT; i++) {
      this.defineColums.push("C" + i.toString());
    }

  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.defineData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputDefineComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputDefineComponent.ROWS_COUNT - 1;

    for (var i = a1; i <= a2; i++) {
      const define = this.input.getDefineDataColumns(i);
      this.defineData.push(define);
      this.rowHeaders.push(i);
    }
  }

}
