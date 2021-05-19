import { Component, OnInit } from "@angular/core";
import { ResultDisgService } from "./result-disg.service";
import { InputLoadService } from "../../input/input-load/input-load.service";
import { ThreeService } from "../../three/three.service";

import { ResultDataService } from "../../../providers/result-data.service";
import { ResultCombineDisgService } from "../result-combine-disg/result-combine-disg.service";
import { ResultPickupDisgService } from "../result-pickup-disg/result-pickup-disg.service";

import { AppComponent } from "src/app/app.component";
import { DataHelperModule } from "src/app/providers/data-helper.module";

import { UserInfoService } from '../../../providers/user-info.service';

@Component({
  selector: "app-result-disg",
  templateUrl: "./result-disg.component.html",
  styleUrls: [
    "./result-disg.component.scss",
    "../../../app.component.scss",
    "../../../floater.component.scss",
  ],
})
export class ResultDisgComponent implements OnInit {
  dataset: any[];
  page: number;
  load_name: string;
  btnCombine: string;
  btnPickup: string;
  dimension: number;

  constructor(
    private data: ResultDisgService,
    private load: InputLoadService,
    private three: ThreeService,
    private comb: ResultCombineDisgService,
    private pic: ResultPickupDisgService,
    private helper: DataHelperModule,
    public user: UserInfoService
  ) {
    this.dataset = new Array();
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
    // ピックアップデータがあればボタンを表示する
    if (this.pic.isCalculated === true) {
      this.btnPickup = "btn-change";
    } else {
      this.btnPickup = "btn-change disabled";
    }

    /*if (this.helper.dimension === 3){
    this.dimension2D = false;
    this.dimension3D = true;
    } else if (this.helper.dimension == 2){
    this.dimension2D = true;
    this.dimension3D = false;
    }*/
  }

  //　pager.component からの通知を受け取る
  onReceiveEventFromChild(eventData: number) {
    let pageNew:number = eventData;
    this.loadPage(pageNew);
  }

  loadPage(currentPage:number) {
    if (currentPage !== this.page) {
      this.page = currentPage;
    }
    this.dataset = this.data.getDisgColumns(this.page);
    this.load_name = this.load.getLoadName(currentPage);

    this.three.ChangeMode('disg');
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
