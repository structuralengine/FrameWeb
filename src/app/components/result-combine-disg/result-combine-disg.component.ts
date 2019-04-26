import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-combine-disg',
  templateUrl: './result-combine-disg.component.html',
  styleUrls: ['./result-combine-disg.component.scss']
})
export class ResultCombineDisgComponent implements OnInit {

  KEYS = ['dx_max', 'dx_min', 'dy_max', 'dy_min', 'dz_max', 'dz_min', 'rx_max', 'rx_min', 'ry_max', 'ry_min', 'rz_max', 'rz_min'];
  TITLES = ['x方向の移動量 最大', 'x方向の移動量 最小', 'y方向の移動量 最大', 'y方向の移動量 最小', 'z方向の移動量 最大', 'Z方向の移動量 最小', 'x軸回りの回転角 最大', 'x軸回りの回転角 最小', 'y軸回りの回転角 最大', 'y軸回りの回転角 最小', 'z軸回りの回転角 最大', 'Z軸回りの回転角 最小'];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.frame.CombinePickup();
    let n: number = this.frame.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);
  }

  loadPage(currentPage: number) {
    if (currentPage != this.page) {
      this.page = currentPage;
    }

    for (let i = 0; i < this.KEYS.length; i++) {
      this.dataset[i] = new Array();
      for (let j = 1; j <= this.result.DISG_ROWS_COUNT; j++) {
        const disg = this.result.getCombineDisgColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(disg)
      }
    }
    this.load_name = this.frame.getCombineName(currentPage);
  }
}
