import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputElementsService } from './input-elements.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { UserInfoService } from '../../../providers/user-info.service'
import { ThreeService } from '../../three/three.service';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-input-elements',
  templateUrl: './input-elements.component.html',
  styleUrls: ['./input-elements.component.scss', '../../../app.component.scss']
})

export class InputElementsComponent implements OnInit, AfterViewInit {

  myControl: FormGroup;
  static ROWS_COUNT = 20;
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
          if (value !== null) {
            switch (changes[i][1]) {
              case "Xp":
                changes[i][3] = value.toExponential(2);
                break;
              case "A":
                changes[i][3] = value.toFixed(4);
                break;
              case "Iy":
              case "Iz":
                changes[i][3] = value.toFixed(6);
                break;
              case "E":
                changes[i][3] = value.toExponential(2);
                break;
              case "G":
                changes[i][3] = value.toExponential(2);
                break;
              case "J":
                changes[i][3] = value.toFixed(4);
                break;
            }
          } else {
            changes[i][3] = null;
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
      this.three.chengeData('elements', this.page);
    }
  };

  private initialFlg = true;
  constructor(
    private data: InputElementsService,
    private helper: DataHelperModule,
    private three: ThreeService,
    public user: UserInfoService) {
    this.dataset = new Array();
    this.page = 1;

    // pagenationのhtml側表示の定義
    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;
  }

  ngOnInit() {
    this.initialFlg = true;
    this.loadPage(1);
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
    for (let i = 191; i <= 195; i++) {
      const data = document.getElementById(i + '');
      if (data != null) {
        if (data.classList.contains('active')) {
          data.classList.remove('active');
        }
      }
    }
  }



  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();

    this.deactiveButtons();

    //this.page = currentPage;

    if (currentPage > 2) {
      this.page0 = currentPage;
      this.page_1 = currentPage - 1;
      this.page_2 = currentPage - 2;
      this.page11 = currentPage + 1;
      this.page12 = currentPage + 2;
      document.getElementById('193').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('192').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;

      document.getElementById('191').classList.add('active');

    }

    for (let i = 1; i <= InputElementsComponent.ROWS_COUNT; i++) {
      const element = this.data.getElementColumns(this.page, i);
      this.dataset.push(element);
    }

    this.three.ChengeMode('elements', currentPage);
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
