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
  styleUrls: ['./result-combine-disg.component.scss']
})
export class ResultCombineDisgComponent implements OnInit {

  KEYS = ['dx_max', 'dx_min', 'dy_max', 'dy_min', 'dz_max', 'dz_min', 'rx_max', 'rx_min', 'ry_max', 'ry_min', 'rz_max', 'rz_min'];
  TITLES = ['x方向の移動量 最大', 'x方向の移動量 最小', 'y方向の移動量 最大', 'y方向の移動量 最小', 'z方向の移動量 最大', 'Z方向の移動量 最小',
    'x軸回りの回転角 最大', 'x軸回りの回転角 最小', 'y軸回りの回転角 最大', 'y軸回りの回転角 最小', 'z軸回りの回転角 最大', 'Z軸回りの回転角 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;

  constructor(private data: ResultCombineDisgService,
              private disg: ResultDisgService,
              private comb: InputCombineService,
              private result: ResultDataService,
              private three: ThreeService,
              private pic: ResultPickupDisgService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.comb.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (Object.keys(this.pic.disgPickup).length > 0) {
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
      for (let j = 1; j <= this.disg.DISG_ROWS_COUNT; j++) {
        const disg = this.data.getCombineDisgColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(disg);
      }
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChengeMode('comb_disg', currentPage);
  }
}
