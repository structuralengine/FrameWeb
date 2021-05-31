import { Component, OnInit, ViewChild } from "@angular/core";
import { InputLoadService } from "./input-load.service";
import { ThreeService } from "../../three/three.service";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { SheetComponent } from "../sheet/sheet.component";
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";
import { ThreeLoadService } from "../../three/geometry/three-load/three-load.service";

@Component({
  selector: "app-input-load-name",
  templateUrl: "./input-load-name.component.html",
  styleUrls: [
    "./input-load-name.component.scss",
    "../../../app.component.scss",
  ],
})
export class InputLoadNameComponent implements OnInit {
  @ViewChild("grid") grid: SheetComponent;

  private dataset = [];
  private columnHeaders = [
    {
      title: "割増し係数",
      dataType: "float",
      format: "#.000",
      dataIndx: "rate",
      sortable: false,
      width: 100,
      align: "right",
    },
    {
      title: "記号",
      dataType: "string",
      dataIndx: "symbol",
      sortable: false,
      width: 80,
      align: "left",
    },
    {
      title: "名称",
      dataType: "string",
      dataIndx: "name",
      sortable: false,
      width: 300,
      align: "left",
    },
    {
      title: "支点",
      dataType: "integer",
      dataIndx: "fix_node",
      sortable: false,
      width: 30,
      align: "right",
    },
    {
      title: "断面",
      dataType: "integer",
      dataIndx: "element",
      sortable: false,
      width: 30,
      align: "right",
    },
    {
      title: "バネ",
      dataType: "integer",
      dataIndx: "fix_member",
      sortable: false,
      width: 30,
      align: "right",
    },
    {
      title: "結合",
      dataType: "integer",
      dataIndx: "joint",
      sortable: false,
      width: 30,
      align: "right",
    },
  ];

  private ROWS_COUNT = 15;

  constructor(
    private data: InputLoadService,
    private three: ThreeService,
    private app: AppComponent,
    private helper: DataHelperModule,
    private threeload: ThreeLoadService
  ) {
    this.loadData(this.ROWS_COUNT);
  }

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js にモードの変更を通知する
    this.three.ChangeMode("load_names");
    this.three.ChangePage(1);
  }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const load_name = this.data.getLoadNameColumns(i);
      this.dataset.push(load_name);
    }
  }

  // 表の高さを計算する
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight();
    return containerHeight.toString();
  }
  // 表高さに合わせた行数を計算する
  private rowsCount(): number {
    const containerHeight = this.app.getDialogHeight();
    return Math.round(containerHeight / 30);
  }

  // グリッドの設定
  options: pq.gridT.options = {
    showTop: false,
    reactive: true,
    sortable: false,
    locale: "jp",
    height: this.tableHeight(),
    numberCell: {
      show: true, // 行番号
      width: 45,
    },
    colModel: this.columnHeaders,
    animModel: {
      on: true,
    },
    dataModel: {
      data: this.dataset,
    },
    beforeTableView: (evt, ui) => {
      const finalV = ui.finalV;
      const dataV = this.dataset.length;
      if (ui.initV == null) {
        return;
      }
      if (finalV >= dataV - 1) {
        this.loadData(dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1;
      const caseNo = row + 1;
      this.three.ChangePage(caseNo);
    },
    change: (evt, ui) => {
      let target: any = null;
      for (let i = 0; i < ui.updateList.length; i++) {
        target = ui.updateList[i];

        const r = this.helper.toNumber(target.rowData["rate"]);
        const s = this.helper.toNumber(target.rowData["symbol"]);
        const fm = this.helper.toNumber(target.rowData["fix_member"]);
        const fn = this.helper.toNumber(target.rowData["fix_node"]);
        const e = this.helper.toNumber(target.rowData["element"]);
        const j = this.helper.toNumber(target.rowData["joint"]);
        const n = target.rowData["name"];

        if (
          r === null &&
          s === null &&
          (n === "" || n === undefined) &&
          fm === null &&
          fn === null &&
          e === null &&
          j === null
        ) {
          this.setNewList(target.rowIndx + 1);
        }
      }
      if( target !== null ){
        this.three.changeData("load_names", target.rowIndx + 1 );
      }
    },
  };

  public setNewList(index) {
    this.data.partClear(index);
    this.threeload.removeCase(index);
  }

}
