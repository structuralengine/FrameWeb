
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputDefineService } from './input-define.service';
import { InputLoadService } from '../input-load/input-load.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { UserInfoService } from '../../../providers/user-info.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-input-define',
  templateUrl: './input-define.component.html',
  styleUrls: ['./input-define.component.scss', '../../../app.component.scss']
})
export class InputDefineComponent implements OnInit, AfterViewInit {
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
          if (value !== null) {
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
        this.result.isCombinePickupChenge = true;
      }
    }
  };

  private initialFlg = true;
  constructor(private input: InputDefineService,
    private load: InputLoadService,
    private result: ResultDataService,
    private helper: DataHelperModule,
    public user: UserInfoService,) {

    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;

    this.defineData = new Array();
    this.defineColums = new Array();
    this.rowHeaders = new Array();
  }

  pagenationShow(id): void {
    this.deactiveButtons();
    console.log(id);
    document.getElementById(id).classList.add('active');
    
  }

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
    this.pagenationShow(101);

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


  loadPage(currentPage: number) {
    this.deactiveButtons();
    if (currentPage !== this.page) {
      
      this.page = currentPage;
      
      if (currentPage > 2) {
        this.page0 = currentPage;
        this.page_1 = currentPage - 1;
        this.page_2 = currentPage - 2;
        this.page11 = currentPage + 1;
        this.page12 = currentPage + 2;
        this.pagenationShow(103);
        document.getElementById('103').classList.add('active');
      

      } else if (currentPage == 2) {
        this.page0 = 3;
        this.page_1 = 2;
        this.page_2 = 1;
        this.page11 = 4;
        this.page12 = 5;
        this.pagenationShow(102);
        document.getElementById('102').classList.add('active');
      }

      else {
        this.page0 = 3;
        this.page_1 = 2;
        this.page_2 = 1;
        this.page11 = 4;
        this.page12 = 5;
        this.pagenationShow(101);
        document.getElementById('101').classList.add('active');

      }
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


  public moveToNextPage(count:number): void {
    let Next: number;
    Next = this.page + count;
    if( Next > 0){
      this.loadPage(Next);
      }else{
        this.loadPage(1);
        this.pagenationShow(101);
        document.getElementById('101').classList.add('active');
      }
      
  }


  click(id = null) {
    let value: number;
    
    if (id === null) {
      value = this.helper.toNumber(this.myControl.value.number2);
    } else {
      value = this.helper.toNumber(id);
    }

    if (value !== null) {
      this.loadPage(value);
      if (this.page > 2) {
        this.pagenationShow(103);
      } else if (this.page == 2) {
        this.pagenationShow(102);
      } else {
        this.pagenationShow(101);
      }
    }
  }
}