import { Component, OnInit, ViewChild } from "@angular/core";
import { InputFixMemberService } from './input-fix-member.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { ThreeService } from '../../three/three.service';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-input-fix-member',
  templateUrl: './input-fix-member.component.html',
  styleUrls: ['./input-fix-member.component.scss','../../../app.component.scss']
})
export class InputFixMemberComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders3D =[
    { title: "部材No",   dataType: "string", dataIndx: "m",  sortable: false, width: 30 },
    { title: "X変位拘束\n(kN/m/m)", dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
    { title: "Y変位拘束\n(kN/m/m)", dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
    { title: "Z変位拘束\n(kN/m/m)", dataType: "float",   dataIndx: "tz", sortable: false, width: 100 },
    { title: "回転拘束\n(kNm/rad/m)",  dataType: "float",   dataIndx: "tr", sortable: false, width: 100 }
  ];
  private columnHeaders2D =[
    { title: "部材No",   dataType: "string", dataIndx: "m",  sortable: false, width: 30 },
    { title: "X変位拘束\n(kN/m/m)", dataType: "float",   dataIndx: "tx", sortable: false, width: 100 },
    { title: "Y変位拘束\n(kN/m/m)", dataType: "float",   dataIndx: "ty", sortable: false, width: 100 },
  ];

  private ROWS_COUNT = 15;
  private page = 1;

  constructor(
    private data: InputFixMemberService,
    private helper: DataHelperModule,
    private app: AppComponent,
    private three: ThreeService) {}


    ngOnInit() {
      this.ROWS_COUNT = this.rowsCount();
      this.loadPage(1, this.ROWS_COUNT);
      this.three.ChangeMode("fix_member");
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
      const fix_node = this.data.getFixMemberColumns(currentPage, i);
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
      this.three.selectChange('fix_member', row, column);
    },
    change: (evt, ui) => {
      this.three.changeData('fix_member', this.page);
    }
  };

  width = (this.helper.dimension === 3) ? 510 : 410 ;

}
