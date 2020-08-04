import { Component, OnInit } from '@angular/core';
import { ResultCombineFsecService } from './result-combine-fsec.service';
import { ResultFsecService } from '../result-fsec/result-fsec.service';
import { InputCombineService } from '../../input/input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { ThreeService } from '../../three/three.service';

import { ResultPickupFsecService } from '../result-pickup-fsec/result-pickup-fsec.service';

@Component({
  selector: 'app-result-combine-fsec',
  templateUrl: './result-combine-fsec.component.html',
  styleUrls: ['./result-combine-fsec.component.scss']
})
export class ResultCombineFsecComponent implements OnInit {

  KEYS = ['fx_max', 'fx_min', 'fy_max', 'fy_min', 'fz_max', 'fz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['軸方向力 最大', '軸方向力 最小', 'y方向のせん断力 最大', 'y方向のせん断力 最小', 'z方向のせん断力 最大', 'z方向のせん断力 最小',
    'ねじりモーメント 最大', 'ねじりモーメント 最小', 'y軸回りの曲げモーメント 最大', 'y軸回りの曲げモーメント力 最小', 'z軸回りの曲げモーメント 最大', 'z軸回りの曲げモーメント 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;

  constructor(private data: ResultCombineFsecService,
              private fsec: ResultFsecService,
              private comb: InputCombineService,
              private result: ResultDataService,
              private three: ThreeService,
              private pic: ResultPickupFsecService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.comb.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (Object.keys(this.pic.fsecPickup).length > 0) {
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
      for (let j = 1; j <= this.fsec.FSEC_ROWS_COUNT; j++) {
        const fsec = this.data.getCombineFsecColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(fsec);
      }
      this.load_name = this.comb.getCombineName(currentPage);
    }

    this.three.ChengeMode('comb_fsec',  currentPage);
  }
}
