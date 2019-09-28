import { Component, OnInit } from '@angular/core';
import { ResultDisgService } from './result-disg.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { UnityConnectorService } from '../../../providers/unity-connector.service';

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

  constructor(private data: ResultDisgService,
              private load: InputLoadService,
              private unity: UnityConnectorService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    const n: number = this.load.getLoadCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (let i = 0; i < this.data.DISG_ROWS_COUNT; i++) {
      const disg = this.data.getDisgColumns(this.page, i);
      this.dataset.push(disg);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.unity.ChengeMode('disg:' + currentPage.toString());
  }
}
