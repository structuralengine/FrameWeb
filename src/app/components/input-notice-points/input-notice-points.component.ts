import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../providers/input-data.service';

@Component({
  selector: 'app-input-notice-points',
  templateUrl: './input-notice-points.component.html',
  styleUrls: ['./input-notice-points.component.scss']
})
export class InputNoticePointsComponent implements OnInit {

  dataset: any[];
  page: number;
  colums: any[];

  constructor(private input: InputDataService) {
    this.dataset = new Array();
    this.page = 1;
    this.colums = new Array();
    for (var i = 1; i <= InputDataService.NOTICE_POINTS_COUNT; i++) {
      this.colums.push( "L" + i.toString() );
    }

  }

  ngOnInit() {

    for (var i = 1; i <= 20; i++) {
      const notice_points = this.input.getNoticePointsColumns(i);
      this.dataset.push(notice_points);
    }

  }

}