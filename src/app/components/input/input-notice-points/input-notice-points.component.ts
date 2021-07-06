import { Component, OnInit, ViewChild } from '@angular/core';
import { InputMembersService } from '../input-members/input-members.service';
import { InputNoticePointsService } from './input-notice-points.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: 'app-input-notice-points',
  templateUrl: './input-notice-points.component.html',
  styleUrls: ['./input-notice-points.component.scss', '../../../app.component.scss']
})

export class InputNoticePointsComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders: any =[
    { title: "部材No", dataType: "string", dataIndx: "m", sortable: false, minwidth: 10, width: 10 },
    { title: "部材長\n(m)", dataType: "float",  format: "#.000", dataIndx: "len", sortable: false, width: 80, editable: false, style: { "background": "#dae6f0" } },
    { title: 'i-端 からの距離(m)', colModel: [] }
  ];

  private ROWS_COUNT = 15;

  constructor(private data: InputNoticePointsService,
              private member: InputMembersService,
              private helper: DataHelperModule,
              private app: AppComponent,
              private three: ThreeService) {

    for (let i = 1; i <= this.data.NOTICE_POINTS_COUNT; i++) {
      const id = "L" + i;
      this.columnHeaders[2].colModel.push({
        title: id,
        dataType: "float",
        format: "#.000",
        dataIndx: id,
        sortable: false,
        width: 80
      });
    }
  }

  ngOnInit() {
    this.ROWS_COUNT = this.rowsCount();
    // three.js にモードの変更を通知する
    this.three.ChangeMode('notice_points');
  }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const notice_points = this.data.getNoticePointsColumns(i);
      const m: string = notice_points['m'];
      if (m !== '') {
        const l: number = this.member.getMemberLength(m);
        notice_points['len'] = (l != null) ? l.toFixed(3) : '';
      }
      this.dataset.push(notice_points);
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
      show: false // 行番号
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
      this.three.selectChange('notice-points', row, column);
    },
    change: (evt, ui) => {
      const changes = ui.updateList;
      for (const target of changes) {
        const row: number = target.rowIndx;
        if (!('m' in target.newRow)) {
          continue;
        }
        const m: string = target.newRow['m'];
        if ( m === null){
          this.dataset[row]['len'] = null;
        } else {
          const l: number = this.member.getMemberLength(m);
          this.dataset[row]['len'] = (l != null) ? l : null;
        }
        this.grid.refreshDataAndView();
      }
      this.three.changeData('notice-points');
    }
  };

}
