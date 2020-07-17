import { Component, OnInit } from '@angular/core';
import { InputMembersService } from '../input-members/input-members.service';
import { InputNoticePointsService } from './input-notice-points.service';
import { ThreeService } from '../../three/three.service';
import { DataHelperModule } from '../../../providers/data-helper.module';

@Component({
  selector: 'app-input-notice-points',
  templateUrl: './input-notice-points.component.html',
  styleUrls: ['./input-notice-points.component.scss']
})

export class InputNoticePointsComponent implements OnInit {

  static ROWS_COUNT = 20;
  dataset: any[];
  page: number;
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
          if( value !== null ) {
            switch(changes[i][1]){
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
      let hotInstance: any;
      let changes: any = undefined;
      for (let i = 0; i < x.length; i++) {
        if (Array.isArray(x[i])) {
          hotInstance = x[i-1];
          changes = x[i];
          break;
        }
      }
      if (changes !== undefined) {
        for (let i = 0; changes.Length; i++) {
          const target = changes[i];
          const row: number = target[0];
          const column: string = target[1];
          const old_value: any = target[2];
          const new_value: any = target[3];
          if (column !== 'm' ) {
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
          notice_points['len'] = (l != null) ? l : '';
          this.dataset[row] = notice_points;
          console.log(hotInstance.render());
        }
      }
      this.three.chengeData('notice-points');
    }
  };

  constructor(private data: InputNoticePointsService,
              private member: InputMembersService,
              private three: ThreeService,
              private helper: DataHelperModule) {

    this.dataset = new Array();
    this.page = 1;
    this.colums = new Array();
    this.rowHeaders = new Array();

    for (let i = 1; i <= InputNoticePointsService.NOTICE_POINTS_COUNT; i++) {
      this.colums.push('L' + i.toString());
    }
  }

  ngOnInit() {
    this.loadPage(1);
    this.three.ChengeMode('notice_points');
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
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
        notice_points['len'] = (l != null) ? l : '';
      }
      this.dataset.push(notice_points);
      this.rowHeaders.push(i);
    }
  }
}