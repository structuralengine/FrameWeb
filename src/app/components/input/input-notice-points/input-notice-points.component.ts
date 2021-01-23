import { Component, OnInit, AfterViewInit } from '@angular/core';
import { InputMembersService } from '../input-members/input-members.service';
import { InputNoticePointsService } from './input-notice-points.service';
import { ThreeService } from '../../three/three.service';
import { UserInfoService } from '../../../providers/user-info.service'
import { DataHelperModule } from '../../../providers/data-helper.module';
import { FormControl, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-input-notice-points',
  templateUrl: './input-notice-points.component.html',
  styleUrls: ['./input-notice-points.component.scss', '../../../app.component.scss']
})

export class InputNoticePointsComponent implements OnInit, AfterViewInit {
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
  colums: any[];
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
              case "m":
                changes[i][3] = value.toFixed(0);
                break;
              default:
                changes[i][3] = value.toFixed(3);
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
      let hotInstance: any;
      let changes: any = undefined;
      for (let i = 0; i < x.length; i++) {
        if (Array.isArray(x[i])) {
          hotInstance = x[i - 1];
          changes = x[i];
          break;
        }
      }
      if (changes !== undefined) {
        for (const target of changes) {
          const row: number = target[0];
          const column: string = target[1];
          const old_value: any = target[2];
          const new_value: any = target[3];
          if (column !== 'm') {
            continue;
          }
          if (old_value === new_value) {
            continue;
          }
          const notice_points: {} = this.dataset[row];
          const m: string = notice_points['m'];
          if (m === '') {
            continue;
          }
          const l: number = this.member.getMemberLength(m);
          notice_points['len'] = (l != null) ? l.toFixed(3) : '';
          this.dataset[row] = notice_points;
          console.log(hotInstance.render());
        }
      }
      this.three.changeData('notice-points');
    }
  };

  private initialFlg = true;
  constructor(private data: InputNoticePointsService,
    private member: InputMembersService,
    private three: ThreeService,
    private helper: DataHelperModule,
    public user: UserInfoService,) {

    this.dataset = new Array();
    // pagenationのhtml側表示の定義
    this.page0 = 3;
    this.page11 = 4;
    this.page12 = 5;
    this.page_1 = 2;
    this.page_2 = 1;
    this.colums = new Array();
    this.rowHeaders = new Array();

    for (let i = 1; i <= InputNoticePointsService.NOTICE_POINTS_COUNT; i++) {
      this.colums.push('L' + i.toString());
    }
  }

  ngOnInit() {
    this.initialFlg = true;
    this.loadPage(1);
    this.three.ChangeMode('notice_points');
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
    for (let i = 151; i <= 155; i++) {
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
      document.getElementById('153').classList.add('active');
    } else if (currentPage == 2) {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('152').classList.add('active');
    }

    else {
      this.page0 = 3;
      this.page_1 = 2;
      this.page_2 = 1;
      this.page11 = 4;
      this.page12 = 5;
      document.getElementById('151').classList.add('active');
    }

    this.dataset = new Array();
    this.rowHeaders = new Array();

    const a1: number = (currentPage - 1) * InputNoticePointsComponent.ROWS_COUNT + 1;
    const a2: number = a1 + InputNoticePointsComponent.ROWS_COUNT - 1;

    for (let i = a1; i <= a2; i++) {
      const notice_points = this.data.getNoticePointsColumns(i);
      const m: string = notice_points['m'];
      if (m !== '') {
        const l: number = this.member.getMemberLength(m);
        notice_points['len'] = (l != null) ? l.toFixed(3) : '';
      }
      this.dataset.push(notice_points);
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
