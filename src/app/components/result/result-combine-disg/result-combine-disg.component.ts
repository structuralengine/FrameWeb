import { Component, OnInit } from "@angular/core";
import { ResultCombineDisgService } from "./result-combine-disg.service";
import { InputCombineService } from "../../input/input-combine/input-combine.service";
import { ThreeService } from "../../three/three.service";
import { ResultPickupDisgService } from "../result-pickup-disg/result-pickup-disg.service";
import { DataHelperModule } from "src/app/providers/data-helper.module";

@Component({
  selector: "app-result-combine-disg",
  templateUrl: "./result-combine-disg.component.html",
  styleUrls: [
    "./result-combine-disg.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultCombineDisgComponent implements OnInit {
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;
  dimension: number;

  constructor(
    private data: ResultCombineDisgService,
    private comb: InputCombineService,
    private three: ThreeService,
    private pic: ResultPickupDisgService,
    private helper: DataHelperModule
  ) {
    this.dataset = new Array();
    this.KEYS = this.data.disgKeys;
    this.TITLES = this.data.titles;
    this.dimension = this.helper.dimension;
  }

  ngOnInit() {
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
      this.dataset.push(this.data.getCombineDisgColumns(this.page, key));
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChangeMode('comb_disg');
    this.three.ChangePage(currentPage);
  }

   /* To copy Text from Textbox */
   copyInputMessage($tbody) {
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = this.helper.table_To_text($tbody);
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }
}
