import { Component, OnInit, ViewChild } from '@angular/core';
import { InputPickupService } from './input-pickup.service';
import { InputLoadService } from '../input-load/input-load.service';
import { InputCombineService } from '../input-combine/input-combine.service';
import { ResultDataService } from '../../../providers/result-data.service';
import { DataHelperModule } from '../../../providers/data-helper.module';
import { SheetComponent } from '../sheet/sheet.component';
import pq from "pqgrid";
import { AppComponent } from "src/app/app.component";

@Component({
  selector: 'app-input-pickup',
  templateUrl: './input-pickup.component.html',
  styleUrls: ['./input-pickup.component.scss','../../../app.component.scss']
})
export class InputPickupComponent implements OnInit {

  @ViewChild('grid') grid: SheetComponent;

  private dataset = [];
  private columnHeaders: object[] = [];
  
  private ROWS_COUNT = 15;
  private COLUMNS_COUNT = 5;

  constructor(
    private data: InputPickupService,
    private load: InputLoadService,
    private comb: InputCombineService,
    private result: ResultDataService,
    private helper: DataHelperModule,
    private app: AppComponent) {

      this.COLUMNS_COUNT = this.comb.getCombineCaseCount();
      if (this.COLUMNS_COUNT <= 0) {
        this.COLUMNS_COUNT = this.load.getLoadCaseCount();
      }
      if (this.COLUMNS_COUNT <= 5) {
        this.COLUMNS_COUNT = 5;
      }
      for (let i = 1; i <= this.COLUMNS_COUNT; i++) {
        const id = "C" + i;
        this.columnHeaders.push({
          title: id,
          dataType: "integer",
          dataIndx: id,
          sortable: false,
          width: 30,
        });
      }
      this.columnHeaders.push({
        title: "名称　　　　　　　　　　　　　　",
        dataType: "string",
        dataIndx: "name",
        sortable: false,
        width: 250,
      });
    }

    ngOnInit() {
      this.ROWS_COUNT = this.rowsCount();
    }

  // 指定行row 以降のデータを読み取る
  private loadData(row: number): void {
    for (let i = this.dataset.length + 1; i <= row; i++) {
      const pickup = this.data.getPickUpDataColumns(i, this.COLUMNS_COUNT + 1);
      this.dataset.push(pickup);
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
      show: true // 行番号
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
    }
  };

}
