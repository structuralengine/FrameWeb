import { Component, OnInit, ViewChild } from '@angular/core';
import { InputMembersService } from './input-members.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: 'app-input-members',
  templateUrl: './input-members.component.html',
  styleUrls: ['./input-members.component.scss','../../../app.component.scss']
})

export class InputMembersComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders3D =[
    { title: "i端",          dataType: "integer",                 dataIndx: "ni", sortable: false, minwidth: 10, width: 10 },
    { title: "j端",          dataType: "integer",                 dataIndx: "nj", sortable: false, minwidth: 10, width: 10 },
    { title: "部材長",        dataType: "float",  format: "#.000", dataIndx: "L", sortable: false, width: 100, editable: false, style: { "background": "#dae6f0" } },
    { title: "材料No",       dataType: "integer",                 dataIndx: "e",  sortable: false, minwidth: 10, width: 10 },
    { title: "コードアングル", dataType: "float",                   dataIndx: "cg", sortable: false, width: 130 }
  ];
  private columnHeaders2D =[
    { title: "i端",          dataType: "integer",                 dataIndx: "ni", sortable: false, minwidth: 10, width: 10 },
    { title: "j端",          dataType: "integer",                 dataIndx: "nj", sortable: false, minwidth: 10, width: 10 },
    { title: "部材長",        dataType: "float",  format: "#.000", dataIndx: "L", sortable: false, width: 100, editable: false, style: { "background": "#dae6f0" } },
    { title: "材料No",       dataType: "integer",                 dataIndx: "e",  sortable: false, minwidth: 10, width: 10 },
  ];

  private ROWS_COUNT = 15;
  
  constructor(private data: InputMembersService,
              private helper: DataHelperModule,
              private app: AppComponent,
              private three: ThreeService) {}

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js にモードの変更を通知する
    this.three.ChangeMode('members');
  }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const member = this.data.getMemberColumns(i);
      const m: string = member['id'];
      if (m !== '') {
        const l: any = this.data.getMemberLength(m);
        member['L'] = (l != null) ? l.toFixed(3) : l;
      }
      this.dataset.push(member);
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
      this.three.selectChange('members', row, column);
    },
    change: (evt, ui) => {
      const changes = ui.updateList;
      for (const target of changes) {
        const row: number = target.rowIndx;
        if (!('ni' in target.newRow || 'nj' in target.newRow)) {
          continue;
        }
        //const new_value = target.rowData;
        const member: {} = this.dataset[row];
        const m: string = member['id'];
        if (m === '') {
          continue;
        }
        const l: number = this.data.getMemberLength(m);
        if (l != null) {
          this.dataset[row]['L'] = l.toFixed(3);
          this.grid.refreshDataAndView();
        }
      }
      this.three.changeData('members');
    }
  };

  width = (this.helper.dimension === 3) ? 480 : 350 ;

}
