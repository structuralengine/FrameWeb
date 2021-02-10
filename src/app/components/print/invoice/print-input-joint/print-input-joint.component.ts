import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { Data } from "@angular/router";

@Component({
  selector: "app-print-input-joint",
  templateUrl: "./print-input-joint.component.html",
  styleUrls: [
    "./print-input-joint.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputJointComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  countCell: number;
  countHead: number;
  countTotal: number = 3;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public joint_table = [];
  public joint_break = [];
  public joint_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.joint_table = new Array();
    this.joint_break = new Array();
    this.joint_typeNum = new Array();
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("joint" in inputJson) {
      const tables = this.printjoint(inputJson); // {body, title}
      this.joint_table = tables.table;
      this.joint_break = tables.break_after;
      this.joint_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(4);
    }
  }

  ngAfterViewInit() { }

  // 結合データ を印刷する
  private printjoint(inputJson): any {
    const json: {} = inputJson["joint"]; // inputJsonからjointだけ取り出す
    const keys: string[] = Object.keys(json);

    // 各タイプの前に改ページ（break_after）が必要かどうか判定する
    const break_after: boolean[] = new Array();
    let ROW = 5;
     for (const index of keys) {
      ROW += 4; // 行
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const countCell = Object.keys(elist).length;
      ROW += countCell;

      if (ROW < 54) {
        break_after.push(false);
      } else {
        if (index === "1") {
          break_after.push(false);
          ROW = 2;
        } else {
          break_after.push(true);
          ROW = 0;
        }
      }
    }

    // テーブル
    const splid: any[] = new Array();
    const title: string[] = new Array();
    let row: number = 7;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const table: any[] = new Array(); // この時点でリセット、再定義 一旦空にする

      title.push(index.toString());

      let body: any[] = new Array();

      for (const key of Object.keys(elist)) {
        const item = elist[key];

        const line = ["", "", "", "", "", "", ""];
        line[0] = item.m;
        line[1] = item.xi.toFixed(4);
        line[2] = item.yi.toExponential(2);
        line[3] = item.zi.toExponential(2);
        line[4] = item.xj.toExponential(2);
        line[5] = item.yj.toFixed(6);
        line[6] = item.zj.toFixed(6);
        body.push(line);
        row++;

        //１テーブルで59行以上データがあるならば
        if (row > 54) {
          table.push(body);
          body = [];
          row = 2;
        }
      }

      if (body.length > 0) {
        table.push(body);
      }
      splid.push(table);
    }

    //最後のページの行数だけ取得している
    // const lastArray = splid.slice(-1)[0];
    // const lastArrayCount = lastArray.length;

     // 全体の高さを計算する
     let countCell = 0;
     for (const index of keys) {
       const elist = json[index]; // 1テーブル分のデータを取り出す
       countCell += Object.keys(elist).length + 1;
     }
     const countHead = keys.length * 2;
     const countSemiHead = splid.length * 2 ;
     const countTotal = countCell + countHead + countSemiHead;
     
     //最後のページの行数だけ取得している
     let lastArrayCount = countTotal % 54;
     if(lastArrayCount === 0){
       lastArrayCount = 54;
     }else { 
      lastArrayCount = countTotal % 54;
     }

    return {
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
