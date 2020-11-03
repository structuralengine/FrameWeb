import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputPickupService } from './input-pickup.service';
import { InputLoadService } from '../input-load/input-load.service';
import { InputCombineService } from '../input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import{ UserInfoService } from '../../../providers/user-info.service'

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss','../../../app.component.scss']
})

export class InputPickupComponent implements OnInit, AfterViewInit {

  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  pickupData: any[];
  pickupColums: any[];
  pickupTitles: any[];
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
          switch (changes[i][1]) {
            case "name":
              break;
            default:
              if ( value !== null ) {
                changes[i][3] = value.toFixed(0);
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
  constructor(private data: InputPickupService,
              private load: InputLoadService,
              private comb: InputCombineService,
              private result: ResultDataService,
              private helper: DataHelperModule,
              public user:UserInfoService,) {

    this.page = 1;
    this.pickupData = new Array();
    this.pickupColums = new Array();
    this.pickupTitles = new Array();
    this.rowHeaders = new Array();
  }

  ngOnInit() {
    this.initialFlg = true;
    this.COLUMNS_COUNT = this.comb.getCombineCaseCount();
    if (this.COLUMNS_COUNT <= 0) {
      this.COLUMNS_COUNT = this.load.getLoadCaseCount();
    }
    if (this.COLUMNS_COUNT <= 5) {
      this.COLUMNS_COUNT = 5;
    }
    for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
      this.pickupColums.push('C' + i.toString());
      this.pickupTitles.push('C' + i.toString());
    }
    this.pickupColums.push('name');
    this.pickupTitles.push('名称　　　　　　　　　　　　　　');
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
    this.pickupData = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * this.ROWS_COUNT + 1;
    const a2: number = a1 + this.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const pickup = this.data.getPickUpDataColumns(i, this.COLUMNS_COUNT + 1);
      this.pickupData.push(pickup);
      this.rowHeaders.push(i);
    }
  }
}
