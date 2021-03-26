import { Component, OnInit } from "@angular/core";
import { ResultPickupReacService } from "./result-pickup-reac.service";
import { ResultReacService } from "../result-reac/result-reac.service";
import { InputPickupService } from "../../input/input-pickup/input-pickup.service";
import { ResultDataService } from "../../../providers/result-data.service";
import { ThreeService } from "../../three/three.service";

import { ResultCombineReacService } from "../result-combine-reac/result-combine-reac.service";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-result-pickup-reac",
  templateUrl: "./result-pickup-reac.component.html",
  styleUrls: [
    "./result-pickup-reac.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultPickupReacComponent implements OnInit {
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnCombine: string;
  tableHeight: number;

  constructor(
    private data: ResultPickupReacService,
    private app: AppComponent,
    private reac: ResultReacService,
    private pickup: InputPickupService,
    private result: ResultDataService,
    private three: ThreeService,
    private comb: ResultCombineReacService
  ) {
    this.dataset = new Array();
    this.KEYS = this.comb.reacKeys;
    this.TITLES = this.comb.titles;
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
      this.dataset.push(this.data.getPickupReacColumns(this.page, key));
    }
    this.load_name = this.pickup.getPickUpName(currentPage);

    this.three.ChangeMode('pik_reac');
    this.three.ChangePage(currentPage);
  }
}
