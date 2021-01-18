import { Component, OnInit } from '@angular/core';
import { ResultFsecService } from './result-fsec.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeService } from '../../three/three.service';

import { ResultDataService } from '../../../providers/result-data.service';
import { ResultCombineFsecService } from '../result-combine-fsec/result-combine-fsec.service';
import { ResultPickupFsecService } from '../result-pickup-fsec/result-pickup-fsec.service';

@Component({
  selector: 'app-result-fsec',
  templateUrl: './result-fsec.component.html',
  styleUrls: ['./result-fsec.component.scss','../../../app.component.scss','../../../floater.component.scss']
})
export class ResultFsecComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  btnPickup: string;

  constructor(private data: ResultFsecService,
              private load: InputLoadService,
              private three: ThreeService,
              private result: ResultDataService,
              private comb: ResultCombineFsecService,
              private pic: ResultPickupFsecService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    const n: number = this.load.getLoadCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // コンバインデータがあればボタンを表示する
    if (this.comb.isChange === false) {
      this.btnCombine = 'btn btn-outline-primary';
    } else {
      this.btnCombine = 'btn btn-outline-primary disabled';
    }
    // ピックアップデータがあればボタンを表示する
    if (this.pic.isChange === false) {
      this.btnPickup = 'btn btn-outline-primary';
    } else {
      this.btnPickup = 'btn btn-outline-primary disabled';
    }
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (let i = 1; i <= this.data.FSEC_ROWS_COUNT; i++) {
      const reac = this.data.getFsecColumns(this.page, i);
      if(reac === null){
        break;
      }
      this.dataset.push(reac);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('fsec', currentPage);
  }
}
