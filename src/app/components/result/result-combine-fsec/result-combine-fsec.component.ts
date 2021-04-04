import { Component, OnInit } from "@angular/core";
import { ResultCombineFsecService } from "./result-combine-fsec.service";
import { ResultFsecService } from "../result-fsec/result-fsec.service";
import { InputCombineService } from "../../input/input-combine/input-combine.service";
import { ResultDataService } from "../../../providers/result-data.service";
import { ThreeService } from "../../three/three.service";

import { ResultPickupFsecService } from "../result-pickup-fsec/result-pickup-fsec.service";
import { AppComponent } from "src/app/app.component";
import { DataHelperModule } from "src/app/providers/data-helper.module";

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
  public KEYS: string[];
  public TITLES: string[];

  dataset: any[];
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;

  constructor(
    private data: ResultCombineFsecService,
    private app: AppComponent,
    private fsec: ResultFsecService,
    private comb: InputCombineService,
    private result: ResultDataService,
    private three: ThreeService,
    private pic: ResultPickupFsecService,
    private helper: DataHelperModule
  ) {
    this.dataset = new Array();
    this.KEYS = this.data.fsecKeys;
    this.TITLES = this.data.titles;
  }

  ngOnInit() {
    const n: number = this.comb.getCombineCaseCount();
    this.loadPage(1);

    // ピックアップデータがあればボタンを表示する
    if (this.pic.isCalculated === false) {
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
      this.dataset.push(this.data.getCombineFsecColumns(this.page, key));
    }
    this.load_name = this.comb.getCombineName(currentPage);

    this.three.ChangeMode('comb_fsec');
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
