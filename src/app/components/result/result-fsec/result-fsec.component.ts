import { Component, OnInit } from "@angular/core";
import { ResultFsecService } from "./result-fsec.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeService } from "../../three/three.service";

import { ResultDataService } from "../../../providers/result-data.service";
import { ResultCombineFsecService } from "../result-combine-fsec/result-combine-fsec.service";
import { ResultPickupFsecService } from "../result-pickup-fsec/result-pickup-fsec.service";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-result-fsec",
  templateUrl: "./result-fsec.component.html",
  styleUrls: [
    "./result-fsec.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultFsecComponent implements OnInit {
  dataset: any[];
  page: number;
  load_name: string;
  collectionSize: number;
  btnCombine: string;
  btnPickup: string;

  constructor(
    private data: ResultFsecService,
    private app: AppComponent,
    private load: InputLoadService,
    private three: ThreeService,
    private result: ResultDataService,
    private comb: ResultCombineFsecService,
    private pic: ResultPickupFsecService
  ) {
    this.dataset = new Array();
  }

  ngOnInit() {
    const n: number = this.load.getLoadCaseCount();
    this.collectionSize = n * 10;
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
    this.dataset.splice(0);
    let pageNew:number = eventData;
    this.loadPage(pageNew);
  }

  loadPage(currentPage: number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = this.data.getFsecColumns(this.page);
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('fsec');
    this.three.ChangePage(currentPage);
  }

}
