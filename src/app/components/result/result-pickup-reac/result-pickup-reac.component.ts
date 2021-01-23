import { Component, OnInit } from '@angular/core';
import { ResultPickupReacService } from './result-pickup-reac.service';
import { ResultReacService } from '../result-reac/result-reac.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultCombineReacService } from '../result-combine-reac/result-combine-reac.service';

@Component({
  selector: 'app-result-pickup-reac',
  templateUrl: './result-pickup-reac.component.html',
  styleUrls: ['./result-pickup-reac.component.scss','../../../app.component.scss','../../../floater.component.scss']
})
export class ResultPickupReacComponent implements OnInit {

  KEYS = ['tx_max', 'tx_min', 'ty_max', 'ty_min', 'tz_max', 'tz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小',
    'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  tableHeight: number;

  constructor(private data: ResultPickupReacService,
              private reac: ResultReacService,
              private pickup: InputPickupService,
              private result: ResultDataService,
              private three: ThreeService,
              private comb: ResultCombineReacService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.pickup.getPickupCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // コンバインデータがあればボタンを表示する
    if (this.comb.isChange === false) {
      this.btnCombine = 'btn btn-outline-primary';
    } else {
      this.btnCombine = 'btn btn-outline-primary disabled';
    }

    // テーブルの高さを計算する
    this.tableHeight = (this.dataset[0].length + 1) * 30;
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (const key of this.KEYS) {
      this.dataset.push(this.data.getPickupReacColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.three.ChangeMode('pik_reac', currentPage);
  }
}
