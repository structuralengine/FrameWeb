import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { ArrayCamera } from "three";
import { PrintService } from "../../print.service";

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
  countCell: number  = 0;
  countHead: number  = 0;
  countTotal: number = 0;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  reROW : number = 0;
  remainCount : number = 0;

  public elements_table = [];
  public elements_break = [];
  public elements_typeNum = [];

  public judge: boolean;

  constructor(private printService: PrintService,
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
    const inputJson: any = this.printService.inputJson;

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

    // テーブル
    const splid: any[] = new Array();
    const title: string[] = new Array();
    let row: number = 8;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const table: any[] = new Array(); // この時点でリセット、再定義 一旦空にする

      title.push(index.toString());

      let body: any[] = new Array();
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
      row = 5; 
    }

    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      countCell += Object.keys(elist).length + 1;
    }
    const countHead = keys.length * 3;
    const countSemiHead = splid.length * 2 ;
    const countTotal = countCell + countHead + countSemiHead + 3;
    
    // 各タイプの前に改ページ（break_after）が必要かどうか判定する
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
        let countHead_break = Math.floor((countCell / 54) *3 + 2);
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
      title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
