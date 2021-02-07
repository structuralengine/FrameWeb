import { Component, OnInit } from '@angular/core';
import { ResultReacService } from './result-reac.service';
import { InputLoadService } from '../../input/input-load/input-load.service';
import { ThreeService } from '../../three/three.service';

import { ResultDataService } from '../../../providers/result-data.service';
import { ResultCombineReacService } from '../result-combine-reac/result-combine-reac.service';
import { ResultPickupReacService } from '../result-pickup-reac/result-pickup-reac.service';

@Component({
  selector: 'app-result-reac',
  templateUrl: './result-reac.component.html',
  styleUrls: ['./result-reac.component.scss','../../../app.component.scss','../../../floater.component.scss']
})
export class ResultReacComponent implements OnInit {

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  btnPickup: string;

  constructor(private data: ResultReacService,
              private load: InputLoadService,
              private three: ThreeService,
              private result: ResultDataService,
              private comb: ResultCombineReacService,
              private pic: ResultPickupReacService) {
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
    for (let i = 0; i < this.data.REAC_ROWS_COUNT; i++) {
      const reac = this.data.getReacColumns(this.page, i);
      this.dataset.push(reac);
    }
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('reac');
    this.three.ChangePage(currentPage);
  }
}
