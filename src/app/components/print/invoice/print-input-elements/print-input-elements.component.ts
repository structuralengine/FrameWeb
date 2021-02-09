import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { ArrayCamera } from "three";

@Component({
  selector: "app-print-input-elements",
  templateUrl: "./print-input-elements.component.html",
  styleUrls: [
    "./print-input-elements.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputElementsComponent implements OnInit, AfterViewInit {
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

  public elements_table = [];
  public elements_break = [];
  public elements_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.elements_table = new Array();
    this.elements_break = new Array();
    this.elements_typeNum = new Array();
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("element" in inputJson) {
      const tables = this.printElement(inputJson);
      this.elements_table = tables.table;
      this.elements_break = tables.break_after;
      this.elements_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(2);
    }
  }

  ngAfterViewInit() { }

  // 材料データ element を印刷する
  private printElement(inputJson): any {
    const json: {} = inputJson["element"]; // inputJsonからelementだけを取り出す
    const keys: string[] = Object.keys(json);

    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      countCell += Object.keys(elist).length + 1;
    }
    const countHead = keys.length * 2;
    const countTotal = countCell + countHead + 3;

    // 各タイプの前に改ページ（break_after）が必要かどうか判定する
    const break_after: boolean[] = new Array();
    let ROW = 7;
    for (const index of keys) {
      ROW += 2; // 行
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const countCell = Object.keys(elist).length;
      ROW += countCell;

      if (ROW < 58) {
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
      const table: any = []; // この時点でリセット、再定義 一旦空にする

      title.push(index.toString());

      let body: any = [];
      for (const key of Object.keys(elist)) {
        const item = elist[key];

        const line = ["", "", "", "", "", "", "", ""];
        line[0] = key;
        line[1] = item.A.toFixed(4);
        line[2] = item.E.toExponential(2);
        line[3] = item.G.toExponential(2);
        line[4] = item.Xp.toExponential(2);
        line[5] = item.Iy.toFixed(6);
        line[6] = item.Iz.toFixed(6);
        line[7] = item.J.toFixed(4);
        body.push(line);
        row++;

        //１テーブルで59行以上データがあるならば
        if (row > 58) {
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
      title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
