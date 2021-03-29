import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { JsonpClientBackend } from "@angular/common/http";
import { DataCountService } from "../dataCount.service";
import { newArray } from "@angular/compiler/src/util";
import { ArrayCamera } from "three";

@Component({
  selector: "app-print-result-pickup-fsec",
  templateUrl: "./print-result-pickup-fsec.component.html",
  styleUrls: [
    "./print-result-pickup-fsec.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultPickupFsecComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  row: number = 0;
  key: string;

  public pickFsec_dataset = [];
  public pickFsec_title = [];
  public pickFsec_case_break = [];
  public pickFsec_type_break = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.pickFsec_dataset = new Array();
    this.pickFsec_title = new Array();
    this.pickFsec_case_break = new Array();
    this.pickFsec_type_break = new Array();
  }

  ngOnInit(): void {
    const resultjson: any = this.ResultData.pickfsec.fsecPickup;
    const keys: string[] = Object.keys(resultjson);
    if (keys.length > 0) {
      const tables = this.printPickForce(resultjson);
      this.pickFsec_dataset = tables.table;
      this.pickFsec_title = tables.titleSum;
      this.pickFsec_case_break = tables.break_after_case;
      this.pickFsec_type_break = tables.break_after_type;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(20);
    }
  }

  ngAfterViewInit() {}

  private printPickForce(json): any {
    const titleSum: any = [];
    const body: any[] = new Array();
    const typeSum: any = [];

    const KEYS = [
      "fx_max",
      "fx_min",
      "fy_max",
      "fy_min",
      "fz_max",
      "fz_min",
      "mx_max",
      "mx_min",
      "my_max",
      "my_min",
      "mz_max",
      "mz_min",
    ];
    //const TITLES = ['軸方向力 最大', '軸方向力 最小', 'y方向のせん断力 最大', 'y方向のせん断力 最小', 'z方向のせん断力 最大', 'z方向のせん断力 最小',
    //  'ねじりモーメント 最大', 'ねじりモーメント 最小', 'y軸回りの曲げモーメント 最大', 'y軸回りの曲げモーメント力 最小', 'z軸回りの曲げモーメント 最大', 'z軸回りの曲げモーメント 最小'];

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
        this.key = KEYS[i];
        typeName.push(this.key);

        const elieli = json[index]; // 1行分のnodeデータを取り出す
        const elist = elieli[this.key]; // 1行分のnodeデータを取り出す.
        let body: any[] = new Array();
        if (i === 0) {
          this.row = 10;
        } else {
          this.row = 7;
        }

        for (const k of Object.keys(elist)) {
          const item = elist[k];
          // 印刷する1行分のリストを作る
          const line = ["", "", "", "", "", "", "", "", "", ""];
          line[0] = item.m.toString();
          line[1] = item.n.toString();
          line[2] = item.l.toFixed(3);
          line[3] = item.fx.toFixed(2);
          line[4] = item.fy.toFixed(2);
          line[5] = item.fz.toFixed(2);
          line[6] = item.mx.toFixed(2);
          line[7] = item.my.toFixed(2);
          line[8] = item.mz.toFixed(2);
          line[9] = item.case;

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
        this.key = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        const elist = elieli[this.key]; // 1行分のnodeデータを取り出す.
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
      table: splid,
      typeSum,
      break_after_case,
      break_after_type,
      this: countTotal,
      last: lastArrayCount, // 最後のページの高さ
    };
  }
}
