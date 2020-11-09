import { Component, OnInit } from '@angular/core';
import { ResultPickupDisgService } from './result-pickup-disg.service';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultCombineDisgService } from '../result-combine-disg/result-combine-disg.service';

@Component({
  selector: 'app-result-pickup-disg',
  templateUrl: './result-pickup-disg.component.html',
  styleUrls: ['./result-pickup-disg.component.scss']
})
export class ResultPickupDisgComponent implements OnInit {

  KEYS = ['dx_max', 'dx_min', 'dy_max', 'dy_min', 'dz_max', 'dz_min', 'rx_max', 'rx_min', 'ry_max', 'ry_min', 'rz_max', 'rz_min'];
  TITLES = ['x方向の移動量 最大', 'x方向の移動量 最小', 'y方向の移動量 最大', 'y方向の移動量 最小', 'z方向の移動量 最大', 'Z方向の移動量 最小',
    'x軸回りの回転角 最大', 'x軸回りの回転角 最小', 'y軸回りの回転角 最大', 'y軸回りの回転角 最小', 'z軸回りの回転角 最大', 'Z軸回りの回転角 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  tableHeight: number;

  constructor(private data: ResultPickupDisgService,
              private disg: ResultDisgService,
              private pickup: InputPickupService,
              private result: ResultDataService,
              private three: ThreeService,
              private comb: ResultCombineDisgService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.pickup.getPickupCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // コンバインデータがあればボタンを表示する
    if (this.comb.isChenge === false) {
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
      this.dataset.push(this.data.getPickupDisgColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.three.ChengeMode('pik_disg', currentPage);
 }
}
