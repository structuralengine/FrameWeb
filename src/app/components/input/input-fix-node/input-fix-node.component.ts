import { Component, OnInit, ViewChild } from "@angular/core";
import { InputFixNodeService } from "./input-fix-node.service";
import { DataHelperModule } from "../../../providers/data-helper.module";
import { ThreeService } from "../../three/three.service";
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: "app-input-fix-node",
  templateUrl: "./input-fix-node.component.html",
  styleUrls: ["./input-fix-node.component.scss", "../../../app.component.scss"],
})
export class InputFixNodeComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders3D =[
    { title: '節点', align: 'center', colModel: [
      { title: "No", align: 'center',   dataType: "string", dataIndx: "n",  sortable: false, width: 30 }]},
    { title: '変位拘束 (kN/m)', align: 'center', colModel: [
      { title: "X方向", dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
      { title: "Y方向", dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
      { title: "Z方向", dataType: "float",   dataIndx: "tz", sortable: false, width: 100 },
    ]},
    { title: '回転拘束 (kN・m/rad)', align: 'center', colModel: [
      { title: "X軸周り", dataType: "float",   dataIndx: "rx", sortable: false, width: 100 },
      { title: "Y軸周り", dataType: "float",   dataIndx: "ry", sortable: false, width: 100 },
      { title: "Z軸周り", dataType: "float",   dataIndx: "rz", sortable: false, width: 100 }
    ]}
  ];
  private columnHeaders2D =[
    { title: '節点', align: 'center', colModel: [
      { title: "No", align: 'center',   dataType: "string", dataIndx: "n",  sortable: false, width: 30 }]},
      { title: '変位拘束 (kN/m)', align: 'center', colModel: [
        { title: "X方向", dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
        { title: "Y方向", dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
      ]},
      { title: '回転拘束', align: 'center', colModel: [
        { title: " (kN・m/rad)", dataType: "float",   dataIndx: "rz", sortable: false, width: 100 }
      ]}
    ];

  private ROWS_COUNT = 15;
  private page = 1;

  constructor(
    private data: InputFixNodeService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService) {}

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    this.loadPage(1, this.ROWS_COUNT);
    this.three.ChangeMode("fix_nodes");
    this.three.ChangePage(1);
  }

  //　pager.component からの通知を受け取る
  onReceiveEventFromChild(eventData: number) {
    this.dataset.splice(0);
    this.loadPage(eventData, this.ROWS_COUNT);
    this.grid.refreshDataAndView();
    this.three.ChangePage(eventData);
  }
  
  // 
  loadPage(currentPage: number, row: number) {

    for (let i = this.dataset.length + 1; i <= row; i++) {
      const fix_node = this.data.getFixNodeColumns(currentPage, i);
      this.dataset.push(fix_node);
    }
    this.page = currentPage;
  }


  // 表の高さを計算する
  private tableHeight(): string {
    const containerHeight = this.app.getDialogHeight() - 70;// pagerの分減じる
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
      show: false // 行番号
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
        this.loadPage(this.page, dataV + this.ROWS_COUNT);
        this.grid.refreshDataAndView();
      }
    },
    selectEnd: (evt, ui) => {
      const range = ui.selection.iCells.ranges;
      const row = range[0].r1 + 1;
      const column = range[0].c1;
      this.three.selectChange('fix_nodes', row, column);
    },
    change: (evt, ui) => {
      this.three.changeData('fix_nodes', this.page);
    }
  };

  width = (this.helper.dimension === 3) ? 712 : 412 ;

}
