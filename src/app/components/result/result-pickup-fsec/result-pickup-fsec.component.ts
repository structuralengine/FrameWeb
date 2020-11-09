import { Component, OnInit } from '@angular/core';
import { ResultPickupFsecService } from './result-pickup-fsec.service';
import { ResultFsecService } from '../result-fsec/result-fsec.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultCombineFsecService } from '../result-combine-fsec/result-combine-fsec.service';

@Component({
  selector: 'app-result-pickup-fsec',
  templateUrl: './result-pickup-fsec.component.html',
  styleUrls: ['./result-pickup-fsec.component.scss']
})
export class ResultPickupFsecComponent implements OnInit {

  KEYS = ['fx_max', 'fx_min', 'fy_max', 'fy_min', 'fz_max', 'fz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['軸方向力 最大', '軸方向力 最小', 'y方向のせん断力 最大', 'y方向のせん断力 最小', 'z方向のせん断力 最大', 'z方向のせん断力 最小',
    'ねじりモーメント 最大', 'ねじりモーメント 最小', 'y軸回りの曲げモーメント 最大', 'y軸回りの曲げモーメント力 最小', 'z軸回りの曲げモーメント 最大', 'z軸回りの曲げモーメント 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  tableHeight: number;

  constructor(private data: ResultPickupFsecService,
              private fsec: ResultFsecService,
              private pickup: InputPickupService,
              private result: ResultDataService,
              private three: ThreeService,
              private comb: ResultCombineFsecService) {
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
      this.dataset.push(this.data.getPickupFsecColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);
    this.three.ChengeMode('pik_fsec', currentPage);
  }
}

