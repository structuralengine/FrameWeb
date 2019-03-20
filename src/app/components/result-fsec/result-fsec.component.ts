import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-fsec',
  templateUrl: './result-fsec.component.html',
  styleUrls: ['./result-fsec.component.scss']
})
export class ResultFsecComponent implements OnInit {

  result: ResultDataService;
  dataset: any[];
  page: number;

  constructor(private ResultData: ResultDataService) {
    this.result = ResultData;
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