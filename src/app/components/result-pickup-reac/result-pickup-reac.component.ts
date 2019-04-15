import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-pickup-reac',
  templateUrl: './result-pickup-reac.component.html',
  styleUrls: ['./result-pickup-reac.component.scss']
})
export class ResultPickupReacComponent implements OnInit {

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