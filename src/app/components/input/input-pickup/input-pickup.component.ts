import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputPickupService } from './input-pickup.service';
import { InputLoadService } from '../input-load/input-load.service';
import { InputCombineService } from '../input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import{ UserInfoService } from '../../../providers/user-info.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss','../../../app.component.scss']
})

export class InputPickupComponent implements OnInit, AfterViewInit {
  message: string;
  myControl: FormGroup;
  number2: string;
  ROWS_COUNT = 20;
  COLUMNS_COUNT: number;
  page: number;
  page_1: number;
  page_2: number;
  page11: number;
  page12: number;
  page0: number;
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

   // pagenationのhtml側表示の定義
   this.page0 = 3;
   this.page11 = 4;
   this.page12 = 5;
   this.page_1 = 2;
   this.page_2 = 1;

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
    this.message = 'please select button.';
    this.myControl = new FormGroup({
      number2: new FormControl(),
    });
  }
  ngAfterViewInit() {
    this.initialFlg = false;
  }
  
  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
    console.log('aa')
  }

  // active属性を外す
  deactiveButtons() {
    for (let i = 161; i <= 165; i++) {
      const data = document.getElementById(i + '');
      if (data != null) {
        if (data.classList.contains('active')) {
          data.classList.remove('active');
        }
      }
    }
  }


  loadPage(currentPage: number) {
    
    if (currentPage === this.page) {
      return; // 何もしない
    }

    this.deactiveButtons();

    this.page = currentPage;

    if (currentPage > 2) {
      this.page0 = currentPage;
      this.page_1 = currentPage - 1;
      this.page_2 = currentPage - 2;
      this.page11 = currentPage + 1;
      this.page12 = currentPage + 2;
      document.getElementById('163').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('162').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;

      document.getElementById('161').classList.add('active');

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

  // ページを飛んだあと左右＜＞に移動や隣ページへの移動周辺、5ページ送り
  public moveToNextPage(count: number, id: number): void {
    let Next: number;
    let additional: number;
    let minus: number;
    var plus: number;

   // 1、2ページ目だけイレギュラーな動きをする
    if (this.page === 1) {
      additional = 2;
      minus = -2;
      plus = -1;
    } else if (this.page === 2) {
      additional = 1;
      minus = -1;
      plus = 0;
     } else {
      additional = 0;
      minus = -1;
      plus = 1;
   }

   Next = this.page + count + additional;
    if(Next < 1){
      Next = 1;
    }

    this.loadPage(Next);
  }

　// 見えないところにボタンを配置してある。ボタンを押すのとEnterを押すのは同じとしているのでこれが発火点となる
  click(id = null) {
    let value: number;

    if (id === null) {
      value = this.helper.toNumber(this.myControl.value.number2);
    } else {
      value = this.helper.toNumber(id);
    }

    if (value !== null) {
      this.loadPage(value);
    }
  }
}
