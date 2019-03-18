import { Component, OnInit } from '@angular/core';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-disg',
  templateUrl: './result-disg.component.html',
  styleUrls: ['./result-disg.component.scss']
})
export class ResultDisgComponent implements OnInit {

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
