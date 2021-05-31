import { Component, OnInit, ViewChild } from "@angular/core";
import { InputNodesService } from "./input-nodes.service";
import { DataHelperModule } from "../../../providers/data-helper.module";

import { ThreeService } from "../../three/three.service";
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: "app-input-nodes",
  templateUrl: "./input-nodes.component.html",
  styleUrls: ["./input-nodes.component.scss", "../../../app.component.scss"],
})
export class InputNodesComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders3D =[
    { title: "X", dataType: "float",  format: "#.000", dataIndx: "x",  sortable: false, width: 90 },
    { title: "Y", dataType: "float",  format: "#.000", dataIndx: "y",  sortable: false, width: 90 },
    { title: "Z", dataType: "float",  format: "#.000", dataIndx: "z",  sortable: false, width: 90 },
  ];
  private columnHeaders2D =[
    { title: "X", dataType: "float",  format: "#.000", dataIndx: "x",  sortable: false, width: 90 },
    { title: "Y", dataType: "float",  format: "#.000", dataIndx: "y",  sortable: false, width: 90 },
  ];

  private ROWS_COUNT = 15;
  public inner_width = 290;

  constructor( private data: InputNodesService,
              private helper: DataHelperModule,
              private app: AppComponent,
              private three: ThreeService) {
                //this.inner_width = (this.helper.dimension === 3) ? 380px : 300px ;
              }

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js にモードの変更を通知する
    this.three.ChangeMode("nodes");
  }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const node = this.data.getNodeColumns(i);
      this.dataset.push(node);
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
      width:45
    },
    colModel: (this.helper.dimension === 3) ? this.columnHeaders3D : this.columnHeaders2D,
    animModel: {
      on: true
    },
    dataModel: {
      data: this.dataset
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
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange('nodes', row, column);
    },
    change: (evt, ui) => {
      this.three.changeData('nodes');
    }
  };

  width = (this.helper.dimension === 3) ? 380 : 290 ;

}
