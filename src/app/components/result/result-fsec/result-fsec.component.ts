import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../../providers/frame-data.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { UnityConnectorService } from '../../../providers/unity-connector.service';

@Component({
  selector: 'app-result-fsec',
  templateUrl: './result-fsec.component.html',
  styleUrls: ['./result-fsec.component.scss']
})
export class ResultFsecComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService,
    private unity: UnityConnectorService) {
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
    for (let i = 1; i <= this.result.FSEC_ROWS_COUNT; i++) {
      const reac = this.result.getFsecColumns(this.page, i);
      this.dataset.push(reac);
    }
    this.load_name = this.frame.getLoadName(currentPage);

    this.unity.ChengeMode('fsec:' + currentPage.toString());
  }
}
