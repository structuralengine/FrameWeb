import { Component, OnInit } from '@angular/core';
import { ResultCombineReacService } from './result-combine-reac.service';
import { ResultReacService } from '../result-reac/result-reac.service';
import { InputCombineService } from '../../input/input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultPickupReacService } from '../result-pickup-reac/result-pickup-reac.service';

@Component({
  selector: 'app-result-combine-reac',
  templateUrl: './result-combine-reac.component.html',
  styleUrls: ['./result-combine-reac.component.scss']
})
export class ResultCombineReacComponent implements OnInit {

  KEYS = ['tx_max', 'tx_min', 'ty_max', 'ty_min', 'tz_max', 'tz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小',
    'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;

  constructor(private data: ResultCombineReacService,
              private fsec: ResultReacService,
              private comb: InputCombineService,
              private result: ResultDataService,
              private three: ThreeService,
              private pic: ResultPickupReacService) {

    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.comb.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (Object.keys(this.pic.reacPickup).length > 0) {
      this.btnPickup = 'btn btn-outline-primary';
    } else {
      this.btnPickup = 'btn btn-outline-primary disabled';
    }
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    for (let i = 0; i < this.KEYS.length; i++) {
      this.dataset[i] = new Array();
      for (let j = 1; j <= this.fsec.REAC_ROWS_COUNT; j++) {
        const reac = this.data.getCombineReacColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(reac);
      }
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChengeMode('comb_reac', currentPage);
  }
}
