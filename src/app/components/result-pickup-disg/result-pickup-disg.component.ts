import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-pickup-disg',
  templateUrl: './result-pickup-disg.component.html',
  styleUrls: ['./result-pickup-disg.component.scss']
})
export class ResultPickupDisgComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.frame.CombinePickup();
    let n: number = this.frame.getPickupCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage != this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (var i = 0; i < this.result.DISG_ROWS_COUNT; i++) {
      const disg = this.result.getDisgColumns(this.page, i);
      this.dataset.push(disg)
    }
    this.load_name = this.frame.getPickUpName(currentPage);
  }
}


