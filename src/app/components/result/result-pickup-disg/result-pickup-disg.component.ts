import { Component, OnInit } from "@angular/core";
import { ResultPickupDisgService } from "./result-pickup-disg.service";
import { ResultDisgService } from "../result-disg/result-disg.service";
import { InputPickupService } from "../../input/input-pickup/input-pickup.service";
import { ResultDataService } from "../../../providers/result-data.service";
import { ThreeService } from "../../three/three.service";

import { ResultCombineDisgService } from "../result-combine-disg/result-combine-disg.service";
import { AppComponent } from "src/app/app.component";
import { DataHelperModule } from "src/app/providers/data-helper.module";

@Component({
  selector: "app-result-pickup-disg",
  templateUrl: "./result-pickup-disg.component.html",
  styleUrls: [
    "../result-combine-disg/result-combine-disg.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultPickupDisgComponent implements OnInit {
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnCombine: string;
  tableHeight: number;
  dimension: number;

  constructor(
    private data: ResultPickupDisgService,
    private pickup: InputPickupService,
    private three: ThreeService,
    private comb: ResultCombineDisgService,
    private helper: DataHelperModule
  ) {
    this.dataset = new Array();
    this.KEYS = this.comb.disgKeys;
    this.TITLES = this.comb.titles;
    this.dimension = this.helper.dimension;
  }

  ngOnInit() {
    this.loadPage(1);

    // コンバインデータがあればボタンを表示する
    if (this.comb.isCalculated === true) {
      this.btnCombine = "btn-change";
    } else {
      this.btnCombine = "btn-change disabled";
    }

    // テーブルの高さを計算する
    this.tableHeight = (this.dataset[0].length + 1) * 30;
  }

  //　pager.component からの通知を受け取る
  onReceiveEventFromChild(eventData: number) {
    let pageNew:number = eventData;
    this.loadPage(pageNew);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = new Array();
    for (const key of this.KEYS) {
      this.dataset.push(this.data.getPickupDisgColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.three.ChangeMode('pik_disg');
    this.three.ChangePage(currentPage);
  }

}
