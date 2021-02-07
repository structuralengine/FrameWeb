import { Component, OnInit } from '@angular/core';
import { ResultDisgService } from './result-disg.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeService } from '../../three/three.service';

import { ResultDataService } from '../../../providers/result-data.service';
import { ResultCombineDisgService } from '../result-combine-disg/result-combine-disg.service';
import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Component({
  selector: 'app-result-disg',
  templateUrl: './result-disg.component.html',
  styleUrls: ['./result-disg.component.scss','../../../app.component.scss','../../../floater.component.scss']
})
export class ResultDisgComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  btnPickup: string;

  constructor(private data: ResultDisgService,
              private load: InputLoadService,
              private three: ThreeService,
              private result: ResultDataService,
              private comb: ResultCombineDisgService,
              private pic: ResultPickupDisgService) {
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
    for (let i = 0; i < this.data.DISG_ROWS_COUNT; i++) {
      const disg = this.data.getDisgColumns(this.page, i);
      this.dataset.push(disg);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('disg');
    this.three.ChangePage(currentPage);
  }
}
