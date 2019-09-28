import { Component, OnInit } from '@angular/core';
import { ResultPickupReacService } from './result-pickup-reac.service';
import { ResultReacService } from '../result-Reac/result-reac.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { UnityConnectorService } from '../../../providers/unity-connector.service';

@Component({
  selector: 'app-result-pickup-reac',
  templateUrl: './result-pickup-reac.component.html',
  styleUrls: ['./result-pickup-reac.component.scss']
})
export class ResultPickupReacComponent implements OnInit {

  KEYS = ['tx_max', 'tx_min', 'ty_max', 'ty_min', 'tz_max', 'tz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小',
    'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private data: ResultPickupReacService,
              private reac: ResultReacService,
              private pickup: InputPickupService,
              private result: ResultDataService,
              private unity: UnityConnectorService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.pickup.getPickupCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    for (let i = 0; i < this.KEYS.length; i++) {
      this.dataset[i] = new Array();
      for (let j = 1; j <= this.reac.REAC_ROWS_COUNT; j++) {
        const reac = this.data.getPickupReacColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(reac);
      }
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.unity.ChengeMode('pik_reac:' + currentPage.toString());
  }
}
