import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-combine',
  templateUrl: './input-combine.component.html',
  styleUrls: ['./input-combine.component.scss']
})
  
export class InputCombineComponent implements OnInit {

  static ROWS_COUNT = 20;
  page: number;
  combineData: any[];
  combineColums: any[];
  rowHeaders: any[];

  constructor(private input: InputDataService) {

    this.page = 1;
    this.combineData = new Array();
    this.combineColums = new Array();
    this.rowHeaders = new Array();

    for (var i = 1; i <= InputDataService.COMBINE_CASE_COUNT; i++) {
      this.combineColums.push("C" + i.toString());
    }

  }

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.combineData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputCombineComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputCombineComponent.ROWS_COUNT - 1;

    for (var i = a1; i <= a2; i++) {
      const combine = this.input.getCombineDataColumns(i);
      this.combineData.push(combine);
      this.rowHeaders.push(i);
    }
  }

}