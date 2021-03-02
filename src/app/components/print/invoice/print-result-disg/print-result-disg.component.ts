import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

import { JsonpClientBackend } from "@angular/common/http";
import { ArrayCamera } from "three";

@Component({
  selector: "app-print-result-disg",
  templateUrl: "./print-result-disg.component.html",
  styleUrls: [
    "../../../../app.component.scss",
    "../invoice.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultDisgComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  reROW: number = 0;
  remainCount: number = 0;

  public disg_table = [];
  public disg_break = [];
  public disg_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService
  ) {
    this.clear();
  }

  public clear(): void {
    this.disg_table   = new Array();
    this.disg_break   = new Array();
    this.disg_typeNum = new Array();
  }

  ngOnInit(): void {
    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.disg.getDisgJson();
    if (resultjson === undefined) {
      this.countArea.setData(12);
    }
    const tables = this.printDisg(resultjson);
    this.disg_table = tables.table;
    this.disg_break = tables.break_after;
    this.disg_typeNum = tables.title;
    this.judge = this.countArea.setCurrentY(tables.this, tables.last);
  }

  ngAfterViewInit() {}

  // 変位量データを印刷する
  private printDisg(json): any {
    const keys: string[] = Object.keys(json);

    // テーブル
    const splid: any[] = new Array();
    const titleSum: string[] = new Array();
    let row: number = 0;
    for (const index of keys) {
      if (index === "1") {
        row = 8;
      } else {
        row = 5;
      }
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const table: any[] = new Array(); // この時点でリセット、再定義 一旦空にする

      // 荷重名称
      const title: any = [];
      let loadName: string = "";
      const l: any = this.InputData.load.getLoadNameJson(null, index);
      if (index in l) {
        loadName = l[index].name;
        title.push(["Case" + index, loadName]);
      }
      titleSum.push(title);

      let body: any[] = new Array();

      for (const key of Object.keys(elist)) {
        const item = elist[key];

        const line = ["", "", "", "", "", "", "", ""];
        line[0] = item.id.toString();
        line[1] = item.dx.toFixed(4);
        line[2] = item.dy.toFixed(4);
        line[3] = item.dz.toFixed(4);
        line[4] = item.rx.toFixed(4);
        line[5] = item.ry.toFixed(4);
        line[6] = item.rz.toFixed(4);
        body.push(line);
        row++;

        //１テーブルで59行以上データがあるならば
        if (row > 54) {
          table.push(body);
          body = [];
          row = 3;
        }
      }

      if (body.length > 0) {
        table.push(body);
      }
      splid.push(table);
    }

    // 全体の高さを計算する
   let countCell = 0;
   for (const index of keys) {
     const elist = json[index]; // 1テーブル分のデータを取り出す
     countCell += Object.keys(elist).length;
   }
   const countHead = keys.length * 2;
   const countSemiHead = splid.length * 3;
   const countTotal = countCell + countHead + countSemiHead + 3;

   //　各タイプの前に改ページ(break_after)が必要かどうかを判定する。
   const break_after: boolean[] = new Array();
   let ROW = 8;
   for (const index of keys) {
     this.reROW = 0;
     const elist = json[index]; // 1テーブル分のデータを取り出す
     let countCell = Object.keys(elist).length;
     ROW += countCell;

     if (ROW < 54) {
       break_after.push(false);
       this.reROW = ROW + 5;
       ROW = ROW + 5;
     } else {
       if (index === "1") {
         break_after.push(false);
       } else {
         break_after.push(true);
         ROW = 0;
        }
        let countHead_break = Math.floor((countCell / 54) * 3 + 2);
        this.reROW = ROW % 55;
        ROW += countHead_break + countCell;
        ROW = ROW % 54;
        ROW += 5;
     }
   }

   this.remainCount = this.reROW;

   //最後のページにどれだけデータが残っているかを求める
   let lastArrayCount: number = this.remainCount;

    return {
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      title: titleSum, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
