import { Component, OnInit } from "@angular/core";
import { ResultPickupFsecService } from "./result-pickup-fsec.service";
import { InputPickupService } from "../../input/input-pickup/input-pickup.service";
import { ThreeService } from "../../three/three.service";

import { ResultCombineFsecService } from "../result-combine-fsec/result-combine-fsec.service";
import { DataHelperModule } from "src/app/providers/data-helper.module";

@Component({
  selector: "app-result-pickup-fsec",
  templateUrl: "./result-pickup-fsec.component.html",
  styleUrls: [
    "../result-combine-fsec/result-combine-fsec.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultPickupFsecComponent implements OnInit {
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnCombine: string;
  tableHeight: number;
  dimension: number;

  constructor(
    private data: ResultPickupFsecService,
    private pickup: InputPickupService,
    private three: ThreeService,
    private comb: ResultCombineFsecService,
    private helper: DataHelperModule
  ) {
    this.dataset = new Array();
    this.KEYS = this.comb.fsecKeys;
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
      this.dataset.push(this.data.getPickupFsecColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.three.ChangeMode('pik_fsec');
    this.three.ChangePage(currentPage);
  }

}
