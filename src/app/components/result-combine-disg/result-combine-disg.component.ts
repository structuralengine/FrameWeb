import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-combine-disg',
  templateUrl: './result-combine-disg.component.html',
  styleUrls: ['./result-combine-disg.component.scss']
})
export class ResultCombineDisgComponent implements OnInit {

  dataset: any[];
  page: number;

  constructor(private result: ResultDataService) {
    this.dataset = new Array();
    this.page = 1;
  }

  ngOnInit() {

    for (var i = 0; i < this.result.DISG_ROWS_COUNT; i++) {
      const disg = this.result.getDisgColumns(this.page, i);
      this.dataset.push(disg)
    }

  }

}
