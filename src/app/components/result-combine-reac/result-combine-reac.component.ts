import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-combine-reac',
  templateUrl: './result-combine-reac.component.html',
  styleUrls: ['./result-combine-reac.component.scss']
})
export class ResultCombineReacComponent implements OnInit {
  
  KEYS = ['tx_max', 'tx_min', 'ty_max', 'ty_min', 'tz_max', 'tz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
  TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小', 'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];
  
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
      for (var j = 1; j <= this.result.REAC_ROWS_COUNT; j++) {
        const reac = this.result.getCombineReacColumns(this.page, j, this.KEYS[i]);
        this.dataset[i].push(reac)
      }
    }
    this.load_name = this.frame.getCombineName(currentPage);
  }
}
