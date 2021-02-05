import { Component, OnInit } from "@angular/core";
import { ResultCombineFsecService } from "./result-combine-fsec.service";
import { ResultFsecService } from "../result-fsec/result-fsec.service";
import { InputCombineService } from "../../input/input-combine/input-combine.service";
import { ResultDataService } from "../../../providers/result-data.service";
import { ThreeService } from "../../three/three.service";

import { ResultPickupFsecService } from "../result-pickup-fsec/result-pickup-fsec.service";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-result-combine-fsec",
  templateUrl: "./result-combine-fsec.component.html",
  styleUrls: [
    "./result-combine-fsec.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultCombineFsecComponent implements OnInit {
  KEYS = [
    "fx_max",
    "fx_min",
    "fy_max",
    "fy_min",
    "fz_max",
    "fz_min",
    "mx_max",
    "mx_min",
    "my_max",
    "my_min",
    "mz_max",
    "mz_min",
  ];
  TITLES = [
    "軸方向力 最大",
    "軸方向力 最小",
    "y方向のせん断力 最大",
    "y方向のせん断力 最小",
    "z方向のせん断力 最大",
    "z方向のせん断力 最小",
    "ねじりモーメント 最大",
    "ねじりモーメント 最小",
    "y軸回りの曲げモーメント 最大",
    "y軸回りの曲げモーメント力 最小",
    "z軸回りの曲げモーメント 最大",
    "z軸回りの曲げモーメント 最小",
  ];

  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;

  constructor(
    private data: ResultCombineFsecService,
    private app: AppComponent,
    private fsec: ResultFsecService,
    private comb: InputCombineService,
    private result: ResultDataService,
    private three: ThreeService,
    private pic: ResultPickupFsecService
  ) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.result.CombinePickup();
    const n: number = this.comb.getCombineCaseCount();
    this.collectionSize = n * 10;
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (this.pic.isChange === false) {
      this.btnPickup = "btn-change";
    } else {
      this.btnPickup = "btn-change disabled";
    }

    // テーブルの高さを計算する
    this.tableHeight = (this.dataset[0].length + 1) * 30;
  }

  //　pager.component からの通知を受け取る
  onReceiveEventFromChild(eventData: number) {
    this.dataset.splice(0);
    let pageNew:number = eventData;
    this.loadPage(pageNew);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (const key of this.KEYS) {
      this.dataset.push(this.data.getCombineFsecColumns(this.page, key));
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChangeMode("comb_fsec", currentPage);
  }
}
