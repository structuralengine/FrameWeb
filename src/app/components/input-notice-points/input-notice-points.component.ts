import { Component, OnInit } from '@angular/core';
import { InputNoticePointsService } from './input-notice-points.service';
import { FrameDataService } from '../../providers/frame-data.service';
import { UnityConnectorService } from '../../providers/unity-connector.service';

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

    afterChange: (hotInstance, changes, source) => {

      if (changes != null) {
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
          const l: number = this.frame.getMemberLength(m);
          notice_points['len'] = (l != null) ? l : '';
          this.dataset[row] = notice_points;
          console.log(hotInstance.render());
        }
        this.unity.chengeData('unity-notice_points');
      }
    }
  };

  constructor(private input: InputNoticePointsService,
              private frame: FrameDataService,
              private unity: UnityConnectorService) {

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
    this.unity.ChengeMode('notice_points');
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
      const notice_points = this.input.getNoticePointsColumns(i);
      const m: string = notice_points['m'];
      if (m !== '') {
        const l: number = this.frame.getMemberLength(m);
        notice_points['len'] = (l != null) ? l : '';
      }
      this.dataset.push(notice_points);
      this.rowHeaders.push(i);
    }
  }
}
