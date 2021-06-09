import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { JsonpClientBackend } from "@angular/common/http";
import { DataCountService } from "../dataCount.service";
import { ResultCombineReacService } from "src/app/components/result/result-combine-reac/result-combine-reac.service";

@Component({
  selector: "app-print-result-pickup-reac",
  templateUrl: "./print-result-pickup-reac.component.html",
  styleUrls: [
    "./print-result-pickup-reac.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultPickupReacComponent implements OnInit {
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  row: number = 0;
  // key: string;

  public pickReac_datase = [];
  public pickReac_dataset = [];
  public pickReac_title = [];
  public pickReac_type = [];

  public pickReac_case_break = [];
  public pickReac_type_break = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService,
    private combReac: ResultCombineReacService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    const resultjson: any = this.ResultData.pickreac.reacPickup;
    const keys: string[] = Object.keys(resultjson);
    if (keys.length > 0) {
      const tables = this.printPickReact(resultjson);
      this.pickReac_dataset = tables.splid;
      this.pickReac_title = tables.titleSum;
      this.pickReac_case_break = tables.break_after_case;
      this.pickReac_type_break = tables.break_after_type;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(17);
    }
  }

  ngAfterViewInit() {}

  private printPickReact(json): any {
    const titleSum: any = [];
    const body: any[] = new Array();
    const typeSum: any = [];

    const KEYS = this.combReac.reacKeys;
    // [
    //   "tx_max",
    //   "tx_min",
    //   "ty_max",
    //   "ty_min",
    //   "tz_max",
    //   "tz_min",
    //   "mx_max",
    //   "mx_min",
    //   "my_max",
    //   "my_min",
    //   "mz_max",
    //   "mz_min",
    // ];
    // const TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小',
    //   'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];

    const keys: string[] = Object.keys(json);

    //　テーブル
    const splid: any = [];
    let typeData: any = [];
    let typeDefinition: any = [];
    let typeName: any = [];
    let typeAll: any = [];
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

      let table: any = [];
      let type: any = [];
      for (let i = 0; i < KEYS.length; i++) {
        const key = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        if(!(key in elieli)) continue;

        typeName.push(key);

        const elist = elieli[key]; // 1行分のnodeデータを取り出す.
        let body: any = [];
        if (i === 0) {
          this.row = 9;
        } else {
          this.row = 6;
        }

        for (const k of Object.keys(elist)) {
          const item = elist[k];
          // 印刷する1行分のリストを作る
          const line = ["", "", "", "", "", "", "", ""];
          line[0] = item.id.toString();
          line[1] = item.tx.toFixed(2);
          line[2] = item.ty.toFixed(2);
          line[3] = item.tz.toFixed(2);
          line[4] = item.mx.toFixed(2);
          line[5] = item.my.toFixed(2);
          line[6] = item.mz.toFixed(2);
          line[7] = item.case;

          body.push(line);
          this.row++;

          //１テーブルで54行以上データがあるならば
          if (this.row > 54) {
            table.push(body);
            body = [];
            this.row = 2;
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
    let ROW_type = 4; // 行
    let ROW_case = 9;
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
          ROW_type += 4;
        } else {
          if (i === 0) {
            break_after_type.push(false);
          } else {
            break_after_type.push(true);
            ROW_type = 0;
          }
          let countHead_break = Math.floor((countCell_type / 54) * 2 + 2);
          ROW_type += countCell_type + countHead_break;
          ROW_type = ROW_type % 54;
          ROW_type += 4;
        }
      }

      //荷重タイプごとに分割するかどうか
      countCell_case += Object.keys(elieli).length;
      ROW_case += countCell_case;
      if (ROW_case < 54) {
        break_after_case.push(false);
        ROW_case += 6;
      } else {
        if (index === "1") {
          break_after_case.push(false);
        } else {
          break_after_case.push(true);
        }
        let countHead_breakLoad = Math.floor((countCell_type / 54) * 2 + 5);
        ROW_case += countCell_type + countHead_breakLoad;
        ROW_case = ROW_type % 54;
        ROW_case += 6;
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
      last: lastArrayCount, // 最後のページの高さ };
    };
  }
}
