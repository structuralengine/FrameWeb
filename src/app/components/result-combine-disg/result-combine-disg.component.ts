import { Component, OnInit } from '@angular/core';
import { FrameDataService } from '../../providers/frame-data.service';
import { ResultDataService } from '../../providers/result-data.service';

@Component({
  selector: 'app-result-combine-disg',
  templateUrl: './result-combine-disg.component.html',
  styleUrls: ['./result-combine-disg.component.scss']
})
export class ResultCombineDisgComponent implements OnInit {

  datasetXmax: any[];
  datasetXmin: any[];
  datasetYmax: any[];
  datasetYmin: any[];
  datasetZmax: any[];
  datasetZmin: any[];
  datasetRXmax: any[];
  datasetRXmin: any[];
  datasetRYmax: any[];
  datasetRYmin: any[];
  datasetRZmax: any[];
  datasetRZmin: any[];


  page: number;
  load_name: string;
  collectionSize: number;

  constructor(private frame: FrameDataService,
    private result: ResultDataService) {
    this.datasetXmax = new Array(); // x方向の移動量最大
    this.datasetXmin = new Array(); // x方向の移動量最小
    this.datasetYmax = new Array();
    this.datasetYmin = new Array();
    this.datasetZmax = new Array();
    this.datasetZmin = new Array();
    this.datasetRXmax = new Array(); // x軸回りの回転量最大
    this.datasetRXmin = new Array(); // x軸回りの回転量最小
    this.datasetRYmax = new Array();
    this.datasetRYmin = new Array();
    this.datasetRZmax = new Array();
    this.datasetRZmin = new Array();
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
    
    this.datasetXmax = new Array();
    for (var i = 0; i < this.result.DISG_ROWS_COUNT; i++) {
      const disg = this.result.getConbineDisgColumns(this.page, i, "x");
      this.datasetXmax.push(disg)
    }

    this.load_name = this.frame.getCombineName(currentPage);
  }
}
