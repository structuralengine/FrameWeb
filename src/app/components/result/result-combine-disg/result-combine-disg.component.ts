import { Component, OnInit } from '@angular/core';
import { ResultCombineDisgService } from './result-combine-disg.service';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { InputCombineService } from '../../input/input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultPickupDisgService } from '../result-pickup-disg/result-pickup-disg.service';

@Component({
  selector: 'app-result-combine-disg',
  templateUrl: './result-combine-disg.component.html',
  styleUrls: ['./result-combine-disg.component.scss','../../../app.component.scss','../../../floater.component.scss']
})
export class ResultCombineDisgComponent implements OnInit {

  public KEYS = ['dx_max', 'dx_min', 'dy_max', 'dy_min', 'dz_max', 'dz_min', 'rx_max', 'rx_min', 'ry_max', 'ry_min', 'rz_max', 'rz_min'];
  public TITLES = ['x方向の移動量 最大', 'x方向の移動量 最小', 'y方向の移動量 最大', 'y方向の移動量 最小', 'z方向の移動量 最大', 'Z方向の移動量 最小',
    'x軸回りの回転角 最大', 'x軸回りの回転角 最小', 'y軸回りの回転角 最大', 'y軸回りの回転角 最小', 'z軸回りの回転角 最大', 'Z軸回りの回転角 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;

  constructor(private data: ResultCombineDisgService,
              private disg: ResultDisgService,
              private comb: InputCombineService,
              private three: ThreeService,
              private result: ResultDataService,
              private pic: ResultPickupDisgService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.comb.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (this.pic.isChange === false) {
      this.btnPickup = 'btn btn-outline-primary';
    } else {
      this.btnPickup = 'btn btn-outline-primary disabled';
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
      this.dataset.push(this.data.getCombineDisgColumns(this.page, key));
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChangeMode('comb_disg', currentPage);
  }
}

