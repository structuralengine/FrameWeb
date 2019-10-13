import { Component, OnInit } from '@angular/core';
import { ResultReacService } from './result-reac.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { UnityConnectorService } from '../../../unity/unity-connector.service';

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

  constructor(private data: ResultReacService,
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
    for (let i = 0; i < this.data.REAC_ROWS_COUNT; i++) {
      const reac = this.data.getReacColumns(this.page, i);
      this.dataset.push(reac);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.unity.ChengeMode('reac:' + currentPage.toString());
  }
}
