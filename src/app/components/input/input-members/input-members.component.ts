import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputMembersService } from './input-members.service';
import { ThreeService } from '../../three/three.service';
import{ UserInfoService } from '../../../providers/user-info.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-members',
  templateUrl: './input-members.component.html',
  styleUrls: ['./input-members.component.scss','../../../app.component.scss']
})

export class InputMembersComponent implements OnInit, AfterViewInit {
  message: string;
  myControl: FormGroup;
  number2: string;
  static ROWS_COUNT = 20;
  page: number;
  page_1: number;
  page_2: number;
  page11: number;
  page12: number;
  page0: number;
  dataset: any[];

  hotTableSettings = {
    afterChange: (...x: any[]) => {
      if (this.initialFlg===true){
        return;
      }
      let hotInstance: any;
      let changes: any = undefined;
      for (let i = 0; i < x.length; i++) {
        if (Array.isArray(x[i])) {
          hotInstance = x[i - 1];
          changes = x[i];
          break;
        }
      }
      if (changes === undefined) {
        return ;
      }
      try {
        for (const target of changes) {
          const row: number = target[0];
          const column: string = target[1];
          const old_value: any = target[2];
          const new_value: any = target[3];
          if (column !== 'ni' && column !== 'nj') {
            continue;
          }
          if (old_value === new_value) {
            continue;
          }
          const member: {} = this.dataset[row];
          const m: string = member['id'];
          if (m === '') {
            continue;
          }
          const l: number = this.data.getMemberLength(m);
          if (l != null) {
            this.dataset[row]['L'] = l.toFixed(3);
            hotInstance.render();
          }
        }
        this.three.chengeData('members');
      } catch (e) {
        console.log(e);
      }

    }
  };

  private initialFlg = true;
  constructor(private data: InputMembersService,
              private three: ThreeService,
              private helper: DataHelperModule,
              public user:UserInfoService) {
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
    this.message = 'please select button.';
    this.myControl = new FormGroup({
      number2: new FormControl(),
    });
    this.three.ChengeMode('members');
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
    for (let i = 131; i <= 135; i++) {
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
      document.getElementById('133').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('132').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;

      document.getElementById('131').classList.add('active');

    }


    this.dataset = new Array();

    const a1: number = (currentPage - 1) * InputMembersComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputMembersComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const member = this.data.getMemberColumns(i);
      const m: string = member['id'];
      if (m !== '') {
        const l: any = this.data.getMemberLength(m);
        member['L'] = (l != null) ? l.toFixed(3) : l;
      }
      this.dataset.push(member);
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
