import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-combine-fsec',
  templateUrl: './result-combine-fsec.component.html',
  styleUrls: ['./result-combine-fsec.component.scss']
})
export class ResultCombineFsecComponent implements OnInit {

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