import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputLoadService } from './input-load.service';
import { ThreeService } from '../../three/three.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-input-load',
  templateUrl: './input-load.component.html',
  styleUrls: ['./input-load.component.scss', '../../../app.component.scss']
})
export class InputLoadComponent implements OnInit, AfterViewInit {
  myControl: FormGroup;
  ROWS_COUNT = 600;
  collectionSize = 100;
  dataset: any[];
  page: number;
  page_1: number;
  page_2: number;
  page11: number;
  page12: number;
  page0: number;
  rowHeaders: any[];
  load_name: string;

  hotTableSettings_point = {
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
              case "n":
                changes[i][3] = value.toFixed(0);
                break;
              default:
                changes[i][3] = value.toFixed(2);
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
      if (this.initialFlg===true){
        return;
      }
      this.three.chengeData('load_points', this.page);
    }
  };

  hotTableSettings_member = {
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
          if (changes[i][1] === "direction") {

          } else {
            const value: number = this.helper.toNumber(changes[i][3]);
            if (value !== null) {
              switch (changes[i][1]) {
                case "n":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "m1":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "m2":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "mark":
                  changes[i][3] = value.toFixed(0);
                  break;
                case "L1":
                  changes[i][3] = value.toFixed(3);
                  break;
                case "L2":
                  changes[i][3] = value.toFixed(3);
                  break;
                default:
                  changes[i][3] = value.toFixed(2);
                  break;
              }
            } else {
              changes[i][3] = null;
            }
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
      this.three.chengeData('load_members', this.page);
    }
  };

  private initialFlg = true;


  constructor(private data: InputLoadService,
              private three: ThreeService,
              private helper: DataHelperModule) {
    this.dataset = new Array();

    // pagenationのhtml側表示の定義
    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;
  }

  ngOnInit() {
    this.initialFlg = true;
    let n: number = this.data.getLoadCaseCount();
    n += 5;
    this.collectionSize = n * 10;
    this.loadPage(1);
    this.myControl = new FormGroup({
      number2: new FormControl(),
    });
  }
  ngAfterViewInit() {
    this.initialFlg = false;
  }

  // active属性を外す
  deactiveButtons() {
    for (let i = 171; i <= 175; i++) {
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

    this.deactiveButtons();
  
   // this.page = currentPage;
  
    if (currentPage > 2) {
      this.page0 = currentPage;
      this.page_1 = currentPage - 1;
      this.page_2 = currentPage - 2;
      this.page11 = currentPage + 1;
      this.page12 = currentPage + 2;
      document.getElementById('173').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('172').classList.add('active');
    }
  
    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
  
      document.getElementById('171').classList.add('active');
  
    }


    this.dataset = new Array();
    //this.rowHeaders = new Array();
  
    // const a1: number = (currentPage - 1) * InputLoadComponent.ROWS_COUNT + 1;
    // const a2: number = a1 + InputLoadComponent.ROWS_COUNT - 1;
  
    // for (let i = a1; i <= a2; i++) {
    //   const loadColumn = this.data.getLoadNameColumns(i);
    //   this.dataset.push(loadColumn);
    //   this.rowHeaders.push(i);
    // }
    // this.three.ChengeMode('loadColumn');
  
   for (let i = 1; i <= this.ROWS_COUNT; i++) {
      const loadColumn = this.data.getLoadColumns(this.page, i);
      this.dataset.push(loadColumn);
    }
    const currentLoad: {} = this.data.getLoadNameColumns(currentPage);
    this.load_name = currentLoad['name'];

    this.three.ChengeMode('load_points', currentPage);
  }

  public loadPointsActive(): void {
    this.three.ChengeMode('load_points');
  }

  public loadMembersActive(): void {
    this.three.ChengeMode('load_members');
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
