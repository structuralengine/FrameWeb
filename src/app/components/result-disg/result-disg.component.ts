import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-disg',
  templateUrl: './result-disg.component.html',
  styleUrls: ['./result-disg.component.scss']
})
export class ResultDisgComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    const n: number = this.frame.getLoadCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (let i = 0; i < this.result.DISG_ROWS_COUNT; i++) {
      const disg = this.result.getDisgColumns(this.page, i);
      this.dataset.push(disg);
    }
    this.load_name = this.frame.getLoadName(currentPage);
  }
}
