import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-pickup-fsec',
  templateUrl: './result-pickup-fsec.component.html',
  styleUrls: ['./result-pickup-fsec.component.scss']
})
export class ResultPickupFsecComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private result: ResultDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 1; i <= this.result.FSEC_ROWS_COUNT; i++) {
      const reac = this.result.getFsecColumns(this.page, i);
      this.dataset.push(reac)
    }

  }

}