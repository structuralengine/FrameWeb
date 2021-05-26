import { Component, ViewChild } from '@angular/core';
import { InputNodesService } from '../input-nodes/input-nodes.service';
import { InputPanelService } from './input-panel.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: 'app-input-panel',
  templateUrl: './input-panel.component.html',
  styleUrls: ['./input-panel.component.scss']
})
export class InputPanelComponent {
  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders: any =[
    //{ title: "パネルID", dataType: "integer", dataIndx: "panelID",  sortable: false, width: 40 },
    { title: "材料No", dataType: "integer", dataIndx: "e",  sortable: false, width: 40 },
    { title: '頂点No.', colModel: [] }
  ];

  private ROWS_COUNT = 15;

  constructor(private data: InputPanelService,
              private node: InputNodesService,
              private helper: DataHelperModule,
              private app: AppComponent,
              private three: ThreeService) {

    for (let i = 1; i <= this.data.PANEL_VERTEXS_COUNT; i++) {
      //const id = "point-" + i;
      this.columnHeaders[1].colModel.push({
        title: i.toString(),
        dataType: "integer",
        //format: "#.000",
        dataIndx: "point-" + i,
        sortable: false,
        minwidth: 30, 
        width: 35
      });
    }
  }

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js にモードの変更を通知する
    this.three.ChangeMode('panel');
    this.three.ChangePage(1);
  }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const panel = this.data.getPanelColumns(i);
      this.dataset.push(panel);
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
    scrollModel: {
      horizontal: true
    },
    locale: "jp",
    height: this.tableHeight(),
    numberCell: {
      show: true, // 行番号
      width: 45
    },
    colModel: this.columnHeaders,
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
      this.three.selectChange('panel', row, column);
    },
    change: (evt, ui) => {
      const changes = ui.updateList;
      for (const target of changes) {
        const row: number = target.rowIndx;
        //if (!(target.newRow.includes('point-')) || !('e' in target.newRow)) {
          //continue;
        //}
        const key = Object.keys(target.newRow);
        const m: string = target.newRow[key.toString()];
        if ( m === null){
          this.dataset[row]['len'] = null;
        //} else {
          //const l: number = this.member.getMemberLength(m);
          //this.dataset[row]['len'] = (l != null) ? l : null;
        }
        this.grid.refreshDataAndView();
      }
      this.three.changeData('panel');
    }
  };

}
