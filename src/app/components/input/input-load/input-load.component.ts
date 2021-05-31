import { Component, OnInit, ViewChild } from "@angular/core";
import { InputLoadService } from "./input-load.service";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { ThreeService } from "../../three/three.service";
import { SheetComponent } from "../sheet/sheet.component";
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-input-load",
  templateUrl: "./input-load.component.html",
  styleUrls: ["./input-load.component.scss", "../../../app.component.scss"],
})
export class InputLoadComponent implements OnInit {
  @ViewChild("grid") grid: SheetComponent;

  public load_name: string;
  private dataset = [];
  private columnHeaders3D = [
    { title: '要素荷重', align: 'center', colModel: [
      { title: "部材1", dataType: "string", dataIndx: "m1", sortable: false, width: 30, },
      { title: "部材2", dataType: "string", dataIndx: "m2", sortable: false, width: 30, },
      { title: "方向",  dataType: "string", dataIndx: "direction",  sortable: false, width: 30, },
      { title: "マーク", dataType: "integer", dataIndx: "mark", sortable: false, width: 60, },
      { title: "L1", dataType: "float", format: "#.000", dataIndx: "L1", sortable: false, width: 70, },
      { title: "L2", dataType: "float", format: "#.000", dataIndx: "L2", sortable: false, width: 70, },
      { title: "P1", dataType: "float", format: "#.00", dataIndx: "P1", sortable: false, width: 70, },
      { title: "P2", dataType: "float", format: "#.00", dataIndx: "P2", sortable: false, width: 70, },
    ]},
    { title: '節点荷重', align: 'center', colModel: [
      { title: "節点No", dataType: "string", dataIndx: "n", sortable: false, width: 30,},
      { title: "X", dataType: "float", format: "#.00", dataIndx: "tx", sortable: false, width: 70, },
      { title: "Y", dataType: "float", format: "#.00", dataIndx: "ty", sortable: false, width: 70, },
      { title: "Z", dataType: "float", format: "#.00", dataIndx: "tz", sortable: false, width: 70, },
      { title: "RX", dataType: "float", format: "#.00", dataIndx: "rx", sortable: false, width: 70, },
      { title: "RY", dataType: "float", format: "#.00", dataIndx: "ry", sortable: false, width: 70, },
      { title: "RZ", dataType: "float", format: "#.00", dataIndx: "rz", sortable: false, width: 70, },
    ]},
  ];
  private columnHeaders2D = [
    { title: '要素荷重', align: 'center', colModel: [
      {title: "部材1", dataType: "string", dataIndx: "m1", sortable: false, width: 30 },
      {title: "部材2", dataType: "string", dataIndx: "m2", sortable: false, width: 30 },
      {title: "方向", dataType: "string", dataIndx: "direction", sortable: false, width: 30 },
      {title: "マーク", dataType: "integer", dataIndx: "mark", sortable: false, width: 60 },
      {title: "L1", dataType: "float", format: "#.000", dataIndx: "L1", sortable: false, width: 70 },
      {title: "L2", dataType: "float", format: "#.000", dataIndx: "L2", sortable: false, width: 70 },
      {title: "P1", dataType: "float", format: "#.00", dataIndx: "P1", sortable: false, width: 70 },
      {title: "P2", dataType: "float", format: "#.00", dataIndx: "P2", sortable: false, width: 70 },
    ]},
    { title: '節点荷重', align: 'center', colModel: [
      {title: "節点No", dataType: "string", dataIndx: "n", sortable: false, width: 30 },
      {title: "X", dataType: "float", format: "#.00", dataIndx: "tx", sortable: false, width: 70 },
      {title: "Y", dataType: "float", format: "#.00", dataIndx: "ty", sortable: false, width: 70 },
      {title: "RZ", dataType: "float", format: "#.00", dataIndx: "rz", sortable: false, width: 70 },
    ]},
  ];

  private ROWS_COUNT = 15;
  private page = 1;

  constructor(
    private data: InputLoadService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService
  ) {}

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    this.loadPage(1, this.ROWS_COUNT);
    const load_name = this.data.getLoadNameColumns(1);
    this.load_name = load_name.name;
    this.three.ChangeMode("load_values");
    this.three.ChangePage(1);
  }

  //　pager.component からの通知を受け取る
  onReceiveEventFromChild(eventData: number) {
    this.dataset.splice(0);
    this.loadPage(eventData, this.ROWS_COUNT);
    this.grid.refreshDataAndView();
    const load_name = this.data.getLoadNameColumns(eventData);
    this.load_name = load_name.name;
    this.three.ChangePage(eventData);
  }

  //
  loadPage(currentPage: number, row: number) {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const load = this.data.getLoadColumns(currentPage, i);
      this.dataset.push(load);
    }

    this.page = currentPage;
  }

  // 表の高さを計算する
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight() - 70; // pagerの分減じる
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
      show: false, // 行番号
    },
    colModel: (this.helper.dimension === 3) ? this.columnHeaders3D : this.columnHeaders2D,
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
        this.loadPage(this.page, dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange("load_values", row, column);
    },
    change: (evt, ui) => {

      for (const range of ui.updateList){
        const row = range.rowIndx + 1;
        this.three.changeData("load_values", row);
      }
    }
  };

  width = (this.helper.dimension === 3) ? 1020 : 810 ;

}
