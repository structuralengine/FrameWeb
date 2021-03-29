import { Component, OnInit } from "@angular/core";
import { ResultCombineReacService } from "./result-combine-reac.service";
import { InputCombineService } from "../../input/input-combine/input-combine.service";
import { ThreeService } from "../../three/three.service";
import { ResultPickupReacService } from "../result-pickup-reac/result-pickup-reac.service";

@Component({
  selector: "app-result-combine-reac",
  templateUrl: "./result-combine-reac.component.html",
  styleUrls: [
    "./result-combine-reac.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultCombineReacComponent implements OnInit {
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;
  public showDetail: boolean;
  constructor(
    private data: ResultCombineReacService,
    private comb: InputCombineService,
    private three: ThreeService,
    private pic: ResultPickupReacService
  ) {
    this.dataset = new Array();
    this.KEYS = this.data.reacKeys;
    this.TITLES = this.data.titles;
  }

  onAccordion($event) {
    this.showDetail = !this.showDetail;
  }

  ngOnInit() {
    const n: number = this.comb.getCombineCaseCount();
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (this.pic.isCalculated === true) {
      this.btnPickup = "btn-change";
    } else {
      this.btnPickup = "btn-change disabled";
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
      this.dataset.push(this.data.getCombineReacColumns(this.page, key));
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChangeMode('comb_reac');
    this.three.ChangePage(currentPage);
  }
}
