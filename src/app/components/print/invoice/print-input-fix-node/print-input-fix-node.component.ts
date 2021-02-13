import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-fix-node",
  templateUrl: "./print-input-fix-node.component.html",
  styleUrls: [
    "./print-input-fix-node.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputFixNodeComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  countCell: number = 0;
  countHead: number = 0;
  countTotal: number= 0;
  fixNode_countArea: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  reROW : number = 0;
  remainCount : number = 0;

  public fixNode_table = [];
  public fixNode_break = [];
  public fixNode_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.fixNode_table = new Array();
    this.fixNode_break = new Array();
    this.fixNode_typeNum = new Array();
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("fix_node" in inputJson) {
      const tables = this.printFixnode(inputJson); // {body, title}
      this.fixNode_table = tables.table;
      this.fixNode_break = tables.break_after;
      this.fixNode_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.countArea.setData(3);
    }
  }

  ngAfterViewInit() { }

  // 支点データ fix_node を印刷する
  private printFixnode(inputJson): any {
    const json: {} = inputJson["fix_node"];
    const keys: string[] = Object.keys(json);

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
          let countHead_break = Math.floor((countCell / 54) *3 + 2);
          this.reROW = ROW % 55;
          ROW += countHead_break;
          ROW = ROW % 54;
          ROW += 5;
        } else {
          break_after.push(true);
          ROW = 0;
          let countHead_break = Math.floor((countCell / 54) *3 + 2);
          this.reROW = ROW % 55;
          ROW += countHead_break+ countCell;
          ROW = ROW % 54;
          ROW += 5;
        }
      }
    }

    this.remainCount = this.reROW;

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

        const line = ["", "", "", "", "", "", ""];
        line[0] = item.n.toString();
        line[1] = item.tx.toString();
        line[2] = item.ty.toString();
        line[3] = item.tz.toString();
        line[4] = item.rx.toString();
        line[5] = item.ry.toString();
        line[6] = item.rz.toString();
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
      countCell += Object.keys(elist).length;
    }
    const countHead = keys.length * 3;
    const countSemiHead = splid.length * 2 ;
    const countTotal = countCell + countHead + countSemiHead + 3;
    
    //最後のページにどれだけデータが残っているかを求める
    let lastArrayCount: number = this.remainCount;
    

    return {
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, //最後のページのcurrentYの行数
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
