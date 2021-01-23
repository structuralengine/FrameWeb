import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputCombineService } from './input-combine.service';
import { InputDefineService } from '../input-define/input-define.service';
import { InputLoadService } from '../input-load/input-load.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { UserInfoService } from '../../../providers/user-info.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-combine',
  templateUrl: './input-combine.component.html',
  styleUrls: ['./input-combine.component.scss', '../../../app.component.scss']
})

export class InputCombineComponent implements OnInit, AfterViewInit {
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
          switch (changes[i][1]) {
            case 'name':
              break;
            default:
              if (value !== null) {
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
      if (this.initialFlg === true) {
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
        this.result.isCombinePickupChange = true;
      }
    }
  };

  private initialFlg = true;
  constructor(private data: InputCombineService,
    private define: InputDefineService,
    private load: InputLoadService,
    private result: ResultDataService,
    private helper: DataHelperModule,
    public user: UserInfoService,) {

    // pagenationのhtml側表示の定義
    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;
    this.combineData = new Array();
    this.combineColums = new Array();
    this.combineTitles = new Array();
    this.rowHeaders = new Array();

  }

  ngOnInit() {
    this.initialFlg = true;
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
    // pagenationの初期設定で1ページ目呼び込み
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
  }

  // active属性を外す
  deactiveButtons() {
    for (let i = 101; i <= 105; i++) {
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
      document.getElementById('103').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('102').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;

      document.getElementById('101').classList.add('active');

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
    if (Next < 1) {
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
