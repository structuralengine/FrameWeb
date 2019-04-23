import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-pickup-fsec',
  templateUrl: './result-pickup-fsec.component.html',
  styleUrls: ['./result-pickup-fsec.component.scss']
})
export class ResultPickupFsecComponent implements OnInit {

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
    for (var i = 1; i <= this.result.FSEC_ROWS_COUNT; i++) {
      const reac = this.result.getFsecColumns(this.page, i);
      this.dataset.push(reac)
    }
    this.load_name = this.frame.getPickUpName(currentPage);
  }
}
