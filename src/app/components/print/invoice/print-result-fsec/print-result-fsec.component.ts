import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';
import { DataCountService } from "../dataCount.service";

@Component({
  selector: 'app-print-result-fsec',
  templateUrl: './print-result-fsec.component.html',
  styleUrls: ['../../../../app.component.scss', '../invoice.component.scss', '../invoice.component.scss']
})
export class PrintResultFsecComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public fsec_table = [];
  public fsec_break = [];
  public fsec_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    // const json: {} = this.ResultData.fsec.getDisgJson();
    const resultjson: any = this.ResultData.fsec.getFsecJson();
    const tables = this.printForce(resultjson);
    this.fsec_table = tables.table;
    this.fsec_break = tables.break_after;
    this.fsec_typeNum = tables.title;
    this.judge = this.countArea.setCurrentY(tables.this, tables.last);
  }

  ngAfterViewInit() {
  }

  // 断面力データを印刷する
  private printForce(json): any {
    const keys: string[] = Object.keys(json);

    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      countCell += Object.keys(elist).length + 1;
    }

    const countHead = keys.length * 2;
    const countTotal = countCell + countHead + 2;

    //　各タイプの前に改ページ(break_after)が必要かどうかを判定する。
    const break_after: boolean[] = new Array();
    let ROW = 0;
    for (const index of keys) {
      ROW += 2; // 行
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const countCell = Object.keys(elist).length;
      ROW += countCell;

      if (ROW < 59) {
        break_after.push(false);
      } else {
        if (index === "1") {
          break_after.push(false);
        } else {
          break_after.push(true);
        }
        ROW = 0;
      }
    }

    // テーブル
    const splid: any = [];
    const titleSum: string[] = new Array();
    let row: number = 0;
    for (const index of keys) {
      if (index === "1") {
        row = 3;
      } else {
        row = 2;
      }
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const table: any = []; // この時点でリセット、再定義 一旦空にする

      // 荷重名称
      const title: any = [];
      let loadName: string = "";
      const l: any = this.InputData.load.getLoadNameJson(null, index);
      if (index in l) {
        loadName = l[index].name;
        title.push(["Case" + index, loadName]);
      }
      titleSum.push(title);

      let body: any = [];

      for (const key of Object.keys(elist)) {
        const item = elist[key];

        const line = ["", "", "", "", "", "", "", ""];
        line[0] = item.m;
        line[1] = item.n;
        line[2] = item.l .toFixed(3);
        line[3] = item.fx.toFixed(2);
        line[4] = item.fy.toFixed(2);
        line[5] = item.fz.toFixed(2);
        line[6] = item.mx.toFixed(2);
        line[7] = item.my.toFixed(2);
        line[8] = item.mz.toFixed(2);
        body.push(line);
        row++;

        //１テーブルで59行以上データがあるならば
        if (row > 59) {
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
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length;

    return {
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      title: titleSum, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}


