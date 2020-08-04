import { Component, OnInit } from '@angular/core';
import { InputCombineService } from './input-combine.service';
import { InputDefineService } from '../input-define/input-define.service';
import { InputLoadService } from '../input-load/input-load.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Component({
  selector: 'app-input-combine',
  templateUrl: './input-combine.component.html',
  styleUrls: ['./input-combine.component.scss']
})

export class InputCombineComponent implements OnInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  combineData: any[];
  combineColums: any[];
  combineTitles: any[];
  rowHeaders: any[];

  hotTableSettings = {
    beforeChange: (...x: any[]) => {
      try {
        let changes: any = undefined;
        for (let i = 0; i < x.length; i++) {
          if (Array.isArray(x[i])) {
            changes = x[i];
            break;
          }
        }
        if (changes === undefined) { return; }
        for (let i = 0; i < changes.length; i++) {
          const value: number = this.helper.toNumber(changes[i][3]);
            switch(changes[i][1]){
              case "name":
                break;
              default:
                if ( value !== null ) {
                  changes[i][3] = value.toFixed(3);
                  } else {
                  changes[i][3] = null;
                  }
                break;
            }
        }
      } catch (e) {
        console.log(e);
      }
    },
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

  constructor(private data: InputCombineService,
    private define: InputDefineService,
    private load: InputLoadService,
    private result: ResultDataService,
    private helper: DataHelperModule) {

    this.page = 1;
    this.combineData = new Array();
    this.combineColums = new Array();
    this.combineTitles = new Array();
    this.rowHeaders = new Array();

  }

  ngOnInit() {
    let head = 'D';
    this.COLUMNS_COUNT = this.define.getDefineCaseCount();
    if (this.COLUMNS_COUNT <= 0) {
      this.COLUMNS_COUNT = this.load.getLoadCaseCount();
      head = 'C';
    }
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.combineColums.push('C' + i.toString());
      this.combineTitles.push(head + i.toString());
    }
    this.combineColums.push('name');
    this.combineTitles.push('名称　　　　　　　　　　　　　　');
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.combineData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * this.ROWS_COUNT + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const combine = this.data.getCombineDataColumns(i, this.COLUMNS_COUNT + 1);
      this.combineData.push(combine);
      this.rowHeaders.push(i);
    }
  }
}
