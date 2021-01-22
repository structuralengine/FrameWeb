import { Component, OnInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { UserInfoService } from '../../../providers/user-info.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-load-name',
  templateUrl: './input-load-name.component.html',
  styleUrls: ['./input-load-name.component.scss', '../../../app.component.scss']
})
export class InputLoadNameComponent implements OnInit {
  message: string;
  myControl: FormGroup;
  number2: string;
  static ROWS_COUNT = 200;
  dataset: any[];
  page: number;
  page_1: number;
  page_2: number;
  page11: number;
  page12: number;
  page0: number;
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
            case "rate":
              if (value !== null) {
                changes[i][3] = value.toFixed(4);
              } else {
                changes[i][3] = null;
              }
              break;
            case "symbol":
            case "name":
              break;

            case "fix_node":
            case "fix_member":
            case "element":
            case "joint":
              if (value !== null) {
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
    afterSelection: (hotInstance, row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
      const a1: number = (this.page - 1) * InputLoadNameComponent.ROWS_COUNT + 1;
      const a2: number = a1 + row;
      this.three.ChengeMode('load_names', a2);
    }
  };


  constructor(private data: InputLoadService,
    private three: ThreeService,
    private helper: DataHelperModule, public user: UserInfoService,) {

    // pagenationのhtml側表示の定義
    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;
  }

  ngOnInit() {
    this.loadPage(1);
    this.message = 'please select button.';
    this.myControl = new FormGroup({
      number2: new FormControl(),
    });
  }

  public dialogClose(): void {
    this.user.isContentsDailogShow = false;
    console.log('aa')
  }

  // active属性を外す
  deactiveButtons() {
    for (let i = 121; i <= 125; i++) {
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
      document.getElementById('123').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('122').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;

      document.getElementById('121').classList.add('active');

    }

    this.dataset = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputLoadNameComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputLoadNameComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const load_name = this.data.getLoadNameColumns(i);
      this.dataset.push(load_name);
      this.rowHeaders.push(i);
    }
    this.three.ChengeMode('load_names');
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
