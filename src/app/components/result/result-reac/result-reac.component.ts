import { Component, OnInit } from "@angular/core";
import { ResultReacService } from "./result-reac.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeService } from "../../three/three.service";

import { ResultDataService } from "../../../providers/result-data.service";
import { ResultCombineReacService } from "../result-combine-reac/result-combine-reac.service";
import { ResultPickupReacService } from "../result-pickup-reac/result-pickup-reac.service";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-result-reac",
  templateUrl: "./result-reac.component.html",
  styleUrls: [
    "./result-reac.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultReacComponent implements OnInit {
  dataset: any[];
  page: number;
  load_name: string;
  btnCombine: string;
  btnPickup: string;

  constructor(
    private data: ResultReacService,
    private app: AppComponent,
    private load: InputLoadService,
    private three: ThreeService,
    private result: ResultDataService,
    private comb: ResultCombineReacService,
    private pic: ResultPickupReacService
  ) {
    this.dataset = new Array();
  }

  ngOnInit() {
    this.loadPage(1);

    // コンバインデータがあればボタンを表示する
    if (this.comb.isChange === false) {
      this.btnCombine = "btn-change";
    } else {
      this.btnCombine = "btn-change disabled";
    }
    // ピックアップデータがあればボタンを表示する
    if (this.pic.isChange === false) {
      this.btnPickup = "btn-change";
    } else {
      this.btnPickup = "btn-change disabled";
    }
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
    this.dataset = this.data.getReacColumns(this.page);
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('reac');
    this.three.ChangePage(currentPage);
  }
}
