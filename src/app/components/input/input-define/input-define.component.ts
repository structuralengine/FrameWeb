import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputDefineService } from './input-define.service';
import { InputLoadService } from '../input-load/input-load.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import{ UserInfoService } from '../../../providers/user-info.service'

@Component({
  selector: 'app-input-define',
  templateUrl: './input-define.component.html',
  styleUrls: ['./input-define.component.scss', '../../../app.component.scss']
})
export class InputDefineComponent implements OnInit, AfterViewInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  defineData: any[];
  defineColums: any[];
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
          if( value !== null ) {
                changes[i][3] = value.toFixed(0);
          } else {
            changes[i][3] = null;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    afterChange: (...x: any[]) => {
      if (this.initialFlg===true){
        return;
      }
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

  private initialFlg = true;
  constructor(private input: InputDefineService,
              private load: InputLoadService,
              private result: ResultDataService,
              private helper: DataHelperModule,
              public user:UserInfoService,) {

    this.page = 1;
    this.defineData = new Array();
    this.defineColums = new Array();
    this.rowHeaders = new Array();
  }

  ngOnInit() {
    this.initialFlg = true;
    this.COLUMNS_COUNT = this.load.getLoadCaseCount() * 2 + 1;
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.defineColums.push('C' + i.toString());
    }

    this.loadPage(1);
  }
  ngAfterViewInit() {
    this.initialFlg = false;
  }
  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
    console.log('aa')
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
