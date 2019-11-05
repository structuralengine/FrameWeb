import { Component, OnInit } from '@angular/core';
import { ResultFsecService } from './result-fsec.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeService } from '../../three/three.service';

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

  constructor(private data: ResultFsecService,
              private load: InputLoadService,
              private three: ThreeService) {
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
    for (let i = 1; i <= this.data.FSEC_ROWS_COUNT; i++) {
      const reac = this.data.getFsecColumns(this.page, i);
      this.dataset.push(reac);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChengeMode('fsec', currentPage);
  }
}
