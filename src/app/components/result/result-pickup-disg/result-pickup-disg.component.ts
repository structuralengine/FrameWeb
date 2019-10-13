import { Component, OnInit } from '@angular/core';
import { ResultPickupDisgService } from './result-pickup-disg.service';
import { ResultDisgService } from '../result-disg/result-disg.service';
import { InputPickupService } from '../../input/input-pickup/input-pickup.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { UnityConnectorService } from '../../../unity/unity-connector.service';

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

  constructor(private data: ResultPickupDisgService,
              private disg: ResultDisgService,
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
      for (let j = 1; j <= this.disg.DISG_ROWS_COUNT; j++) {
        const disg = this.data.getPickupDisgColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(disg);
      }
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.unity.ChengeMode('pik_disg:' + currentPage.toString());
 }
}
