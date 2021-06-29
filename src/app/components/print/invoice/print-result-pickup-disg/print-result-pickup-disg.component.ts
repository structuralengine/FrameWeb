import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { JsonpClientBackend } from "@angular/common/http";
import { DataCountService } from "../dataCount.service";
import { ResultCombineDisgService } from "src/app/components/result/result-combine-disg/result-combine-disg.service";
import { DataHelperModule } from "src/app/providers/data-helper.module";

@Component({
  selector: "app-print-result-pickup-disg",
  templateUrl: "./print-result-pickup-disg.component.html",
  styleUrls: [
    "./print-result-pickup-disg.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultPickupDisgComponent implements OnInit, AfterViewInit {
  isEnable = true;
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  row: number = 0;
  dimension: number;

  public pickDisg_dataset = [];
  public pickDisg_title = [];
  public pickDisg_case_break = [];
  public pickDisg_type_break = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService,
    private combDisg: ResultCombineDisgService,
    private helper: DataHelperModule ) {
    this.dimension = this.helper.dimension;
    this.clear();
  }

  public clear(): void {
    this.pickDisg_dataset = new Array();
    this.pickDisg_title = new Array();
    this.pickDisg_case_break = new Array();
    this.pickDisg_type_break = new Array();
  }

  ngOnInit(): void {
    const resultjson: any = this.ResultData.pickdisg.disgPickup;
    const keys: string[] = Object.keys(resultjson);
    if (keys.length > 0) {
      const tables = this.printPickDisg(resultjson);
      this.pickDisg_dataset = tables.splid;
      this.pickDisg_title = tables.titleSum;
      this.pickDisg_case_break = tables.break_after_case;
      this.pickDisg_type_break = tables.break_after_type;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.isEnable = false;
    }
  }

  ngAfterViewInit() {}

  // 変位量データを印刷する
  private printPickDisg(json): any {
    const titleSum: any[] = new Array();
    let body: any[] = new Array();
    const typeSum: any[] = new Array();

    const KEYS = this.combDisg.disgKeys;
    // [
    //   "dx_max",
    //   "dx_min",
    //   "dy_max",
    //   "dy_min",
    //   "dz_max",
    //   "dz_min",
    //   "rx_max",
    //   "rx_min",
    //   "ry_max",
    //   "ry_min",
    //   "rz_max",
    //   "rz_min",
    // ];

    const keys: string[] = Object.keys(json);

    //　テーブル
    const splid: any[] = new Array();
    let typeData: any[] = new Array();
    let typeDefinition: any[] = new Array();
    let typeName: any[] = new Array();
    let typeAll: any[] = new Array();
    this.row = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す

      // 荷重名称
      const title: any = [];
      let loadName: string = "";
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

      let table: any[] = new Array();
      let type: any[] = new Array();
      for (let i = 0; i < KEYS.length; i++) {
        const key = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        if(!(key in elieli)) continue;

        typeName.push(key);

        const elist = elieli[key]; // 1行分のnodeデータを取り出す.
        let body: any[] = new Array();
        if (i === 0) {
          this.row = 10;
        } else {
          this.row = 7;
        }

        for (const k of Object.keys(elist)) {
          const item = elist[k];
          // 印刷する1行分のリストを作る
          const line = ["", "", "", "", "", "", "", ""];
          line[0] = k.toString();
          line[1] = item.dx.toFixed(4);
          line[2] = item.dy.toFixed(4);
          line[3] = item.dz.toFixed(4);
          line[4] = item.rx.toFixed(4);
          line[5] = item.ry.toFixed(4);
          line[6] = item.rz.toFixed(4);
          line[7] = item.case;

          body.push(line);
          this.row++;

          //１テーブルで54行以上データがあるならば
          if (this.row > 54) {
            table.push(body);
            body = [];
            this.row = 3;
          }
        }
        if (body.length > 0) {
          table.push(body);
        }

        if (table.length > 0) {
          typeData.push(table);
          table = [];
        }
        typeDefinition.push(typeName, typeData);
        typeAll.push(typeDefinition);
        typeName = [];
        typeData = [];
        typeDefinition = [];
      }
      splid.push(typeAll);
      typeAll = [];
    }

    let countHead: number = 0;
    let countSemiHead: number = 0;
    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      for (let i = 0; i < KEYS.length; i++) {
        const key = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        if(!(key in elieli)) continue;

        const elist = elieli[key]; // 1行分のnodeデータを取り出す.
        for (const k of Object.keys(elist)) {
          countCell += Object.keys(elist).length;
        }
        countSemiHead += Object.keys(elieli).length * 3;
      }
      countHead += Object.keys(json).length;
    }

    const countTotal = countCell + countHead + countSemiHead + 3;

    //　各荷重状態の前に改ページ(break_after)が必要かどうかを判定する。
    const break_after_case: boolean[] = new Array();
    const break_after_type: boolean[] = new Array();
    let ROW_type = 7; // 行
    let ROW_case = 10;
    let countCell_type: number = 0;
    let countCell_case: number = 0;
    for (const index of Object.keys(json)) {
      const elieli = json[index]; // 1行分のnodeデータを取り出す
      for (let i = 0; i < KEYS.length; i++) {
        const key: string = KEYS[i];
        if(!(key in elieli)) continue;

        const elist = elieli[key]; // 1行分のnodeデータを取り出す.

        // x方向Max,minなどのタイプでの分割
        countCell_type = Object.keys(elist).length;

        ROW_type += countCell_type;
        ROW_case += countCell_type;

        if (ROW_type < 54) {
          break_after_type.push(false);
          ROW_type += 5;
        } else {
          if (i === 0) {
            break_after_type.push(false);
          } else {
            break_after_type.push(true);
            ROW_type = 0;
          }
          let countHead_break = Math.floor((countCell_type / 54) * 3 + 2);
          ROW_type += countCell_type + countHead_break;
          ROW_type = ROW_type % 54;
          ROW_type += 5;
        }
      }

      //荷重タイプごとに分割するかどうか
      countCell_case += Object.keys(elieli).length;
      ROW_case += countCell_case;
      if (ROW_case < 54) {
        break_after_case.push(false);
        ROW_case += 7;
      } else {
        if (index === "1") {
          break_after_case.push(false);
        } else {
          break_after_case.push(true);
        }
        let countHead_breakLoad = Math.floor((countCell_type / 54) * 3 + 5);
        ROW_case += countCell_type + countHead_breakLoad;
        ROW_case = ROW_type % 54;
        ROW_case += 7;
      }
    }

    //最後のページの行数だけ取得している
    let lastArrayCount: number = countTotal % 54;

    return {
      titleSum,
      splid,
      typeSum,
      break_after_case,
      break_after_type,
      this: countTotal,
      last: lastArrayCount, // 最後のページの高さ
    };
  }
}
