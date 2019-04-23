import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-reac',
  templateUrl: './result-reac.component.html',
  styleUrls: ['./result-reac.component.scss']
})
export class ResultReacComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    let n: number = this.frame.getLoadCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage != this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (var i = 0; i < this.result.REAC_ROWS_COUNT; i++) {
      const reac = this.result.getReacColumns(this.page, i);
      this.dataset.push(reac)
    }
    this.load_name = this.frame.getLoadName(currentPage);
  }
}

