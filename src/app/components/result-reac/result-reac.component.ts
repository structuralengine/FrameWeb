import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-reac',
  templateUrl: './result-reac.component.html',
  styleUrls: ['./result-reac.component.scss']
})
export class ResultReacComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private result: ResultDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 0; i < this.result.REAC_ROWS_COUNT; i++) {
      const reac = this.result.getReacColumns(this.page, i);
      this.dataset.push(reac)
    }

  }

}