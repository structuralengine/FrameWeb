import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { JsonpClientBackend } from "@angular/common/http";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-result-combine-disg",
  templateUrl: "./print-result-combine-disg.component.html",
  styleUrls: [
    "../../../../app.component.scss",
    "../invoice.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultCombineDisgComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  row: number = 0;
  key: string;

  public combDisg_dataset = [];
  public combDisg_title = [];
  public combDisg_type = [];

  public combDisg_case_break = [];
  public combDisg_type_break = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.combdisg.disgCombine;
    const tables = this.printCombDisg(resultjson);
    this.combDisg_dataset = tables.splid;
    this.combDisg_title = tables.titleSum;
    this.combDisg_case_break = tables.break_after_case;
    this.combDisg_type_break = tables.break_after_type;
    this.judge = this.countArea.setCurrentY(tables.this, tables.last);
  }

  ngAfterViewInit() {}

  // 変位量データを印刷する
  private printCombDisg(json): any {
    const titleSum: any = [];
    let body: any[] = new Array();
    const typeSum: any = [];

    const KEYS = [
      "dx_max",
      "dx_min",
      "dy_max",
      "dy_min",
      "dz_max",
      "dz_min",
      "rx_max",
      "rx_min",
      "ry_max",
      "ry_min",
      "rz_max",
      "rz_min",
    ];

    const keys: string[] = Object.keys(json);
    let countHead: number = 0;
    let countSemiHead: number = 0;
    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      for (let i = 0; i < KEYS.length; i++) {
        this.key = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        const elist = elieli[this.key]; // 1行分のnodeデータを取り出す.
        for (const k of Object.keys(elist)) {
          countCell += Object.keys(elist).length;
        }
        countSemiHead += Object.keys(elieli).length * 2;
      }
      countHead += Object.keys(json).length;
    }

    const countTotal = countCell + countHead + countSemiHead + 2;

    //　各荷重状態の前に改ページ(break_after)が必要かどうかを判定する。
    const break_after_case: boolean[] = new Array();
    const break_after_type: boolean[] = new Array();
    let ROW_type = 6; // 行
    let ROW_case = 1;
    let countCell_type: number = 0;
    let countCell_case: number = 0;
    for (const index of Object.keys(json)) {
      const elieli = json[index]; // 1行分のnodeデータを取り出す
      for (let i = 0; i < KEYS.length; i++) {
        const key: string = KEYS[i];
        const elist = elieli[key]; // 1行分のnodeデータを取り出す.

        // x方向Max,minなどのタイプでの分割
        countCell_type = Object.keys(elist).length;

        ROW_type += countCell_type;
        ROW_case += countCell_type;

        if (ROW_type < 59) {
          break_after_type.push(false);
          ROW_type += 3;
        } else {
          break_after_type.push(true);
          countCell_type = Object.keys(elist).length;
          // if (i === 0) {
          //   break_after_type.push(false);
          // } else {
          //   break_after_type.push(true);
          // }
          ROW_type = 4 + countCell_type;
        }
      }
      //荷重タイプごとに分割するかどうか
      countCell_case += Object.keys(elieli).length;
      ROW_case += countCell_case;
      if (ROW_case < 59) {
        break_after_case.push(false);
      } else {
        if (index === "1") {
          break_after_case.push(false);
          ROW_type += 2;
        } else {
          break_after_case.push(true);
          ROW_case = 1;
        }
        // if (i === 0) {
        //   break_after_case.push(false);
        // } else {
        //   break_after_case.push(true);
        // }
      }
    }

    //　テーブル
    const splid: any = [];
    let table1: any = [];
    let table2: any = [];
    let table3: any = [];
    let table4: any = [];
    //const titleSum: string[] = new Array();
    this.row = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す

      const typeName: any = [];

      // 荷重名称
      const title: any = [];
      let loadName: string = "";
      //const l: any = this.InputData.load.getLoadNameJson(null, index);
      const combineJson: any = this.InputData.combine.getCombineJson();
      if (index in combineJson) {
        if ("name" in combineJson[index]) {
          loadName = combineJson[index].name;
          title.push(["Case" + index, loadName]);
        } else {
          title.push(["Case" + index]);
        }
      }
      titleSum.push(title);
      //   const title: string = TITLES[i];

      //   let body: any[] = new Array();

      //   doc.text(this.margine.left + (fontsize / 2), currentY + LineFeed, title);

      let table: any = [];
      let type: any = [];
      for (let i = 0; i < KEYS.length; i++) {
        this.key = KEYS[i];
        table3.push(this.key);

        const elieli = json[index]; // 1行分のnodeデータを取り出す
        const elist = elieli[this.key]; // 1行分のnodeデータを取り出す.
        let body: any = [];
        if (i === 0) {
          this.row = 3;
        } else {
          this.row = 2;
        }

        for (const k of Object.keys(elist)) {
          const item = elist[k];
          // 印刷する1行分のリストを作る
          const line = ["", "", "", "", "", "", "", ""];
          line[0] = item.id.toString();
          line[1] = item.dx.toFixed(4);
          line[2] = item.dy.toFixed(4);
          line[3] = item.dz.toFixed(4);
          line[4] = item.rx.toFixed(4);
          line[5] = item.ry.toFixed(4);
          line[6] = item.rz.toFixed(4);
          line[7] = item.case;

          body.push(line);
          this.row++;

          //１テーブルで59行以上データがあるならば
          if (this.row > 59) {
            table.push(body);
            body = [];
            this.row = 2;
          }
        }
        if (body.length > 0) {
          table.push(body);
        }

        if (table.length > 0) {
          table1.push(table);
          table = [];
        }
        table2.push(table3, table1);
        table4.push(table2);
        table3 = [];
        table1 = [];
        table2 = [];

        // if (this.row > 59) {
        //    table1.push(table);
        //    table = [];
        //   this.row = 2;
        // }

        // table1.push(table);
        // table = [];
        // this.row += 2;
      }

      splid.push(table4);
      table4 = [];
      // body.push(table1);
    }
    //最後のページの行数だけ取得している
    let lastArrayCount: number = countTotal % 61;

    return {
      titleSum,
      table1,
      splid,
      typeSum,
      break_after_case,
      break_after_type,
      this: countTotal,
      last: lastArrayCount, // 最後のページの高さ };
    };
  }
}
