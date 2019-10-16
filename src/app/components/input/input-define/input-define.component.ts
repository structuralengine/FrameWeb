import { Component, OnInit } from '@angular/core';
import { InputDefineService } from './input-define.service';
import { InputLoadService } from '../input-load/input-load.service';
import { ResultDataService } from '../../../providers/result-data.service';

@Component({
  selector: 'app-input-define',
  templateUrl: './input-define.component.html',
  styleUrls: ['./input-define.component.scss']
})
export class InputDefineComponent implements OnInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  defineData: any[];
  defineColums: any[];
  rowHeaders: any[];

  hotTableSettings = {
    afterChange: (...x: any[]) => {
      let changes: any = undefined;
      for (let i = 0; i < x.length; i++) {
        if (Array.isArray(x[i])) {
          changes = x[i];
          break;
        }
      }
      if (changes !== undefined) {
        this.result.isCombinePickupChenge = true;
      }
    }
  };

  constructor(private input: InputDefineService,
              private load: InputLoadService,
              private result: ResultDataService) {

    this.page = 1;
    this.defineData = new Array();
    this.defineColums = new Array();
    this.rowHeaders = new Array();
  }

  ngOnInit() {
    this.COLUMNS_COUNT = this.load.getLoadCaseCount() * 2 + 1;
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.defineColums.push('C' + i.toString());
    }

    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.defineData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * this.ROWS_COUNT + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const define = this.input.getDefineDataColumns(i, this.COLUMNS_COUNT);
      this.defineData.push(define);
      this.rowHeaders.push(i);
    }
  }
}
