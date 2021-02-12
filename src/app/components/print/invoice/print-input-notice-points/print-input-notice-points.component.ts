import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { Data } from "@angular/router";

@Component({
  selector: "app-print-input-notice-points",
  templateUrl: "./print-input-notice-points.component.html",
  styleUrls: [
    "./print-input-notice-points.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputNoticePointsComponent implements OnInit, AfterViewInit {
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

  public judge: boolean;

  public notice_dataset = [];
  public notice_page = [];

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    // countArea.dataExists[5] = true;
    this.clear();
  }

  public clear(): void {
    this.notice_dataset = new Array();
    this.notice_page = new Array();
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("notice_points" in inputJson) {
      const tables = this.printNoticepoints(inputJson); // {body, title}
      this.notice_dataset = tables.table;
      //this.notice_page = tables.page;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);}
    else {
      this.countArea.setData(5);
     }
  }

  ngAfterViewInit() {}

  // 着目点データ notice_points を印刷する
  private printNoticepoints(inputJson): any {
    let body: any[] = new Array();
    let page: number = 0;
    const temp: [] = inputJson["notice_points"]; // inputJsonからnodeだけを取り出す
    const json = [];
    let i = 1;
    while (json.length < temp.length) {
      const item = temp.find((element) => element["row"] === i);
      if (item !== undefined) {
        json.push(item);
      }
      i++;
    }

    //const keys: string[] = Object.keys(json);

    // テーブル
    const splid: any[] = new Array();
    let row:number = 6; // タイトル行
    for (const item of json) {
      //const item = json[index]; // 1行分のnodeデータを取り出す
      let line: string[] = new Array();
      const len: number = this.InputData.member.getMemberLength(item.m); // 部材長さ

      if (len !== null) {
        line.push(len.toFixed(3));
      } else {
        line.push("");
      }

      let counter: number = 0;
      for (const key of Object.keys(item.Points)) {
        line.push(item.Points[key].toFixed(3));
        counter += 1;
        if (counter === 10) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(""); // 部材No
          line.push(""); // 部材長
          row++;
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
      }

      //１テーブルで59行以上  になったら
      if (row > 54) {
        splid.push(body);
        body = [];
        row = 3;
      }

      row++;
    }

    if (body.length > 0) {
      splid.push(body);
    }

    //全部の行数を取得している。
    this.countTotal = json.length + splid.length * 2;

    //最後のページの行数だけ取得している
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length + 2;

    return {
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      this: this.countTotal, // 全体の高さ
      last: lastArrayCount, // 最後のページの高さ
    };
  }
}

//     while (break_flg) {
//       for (let i = 0; i < 59; i++) {
//         let line: string[] = new Array();
//         let index: string = keys[i];
//         const item = json[index]; // 1行分のnodeデータを取り出す
//         const len: number = this.InputData.member.getMemberLength(item.m); // 部材長さ
//         const j = page * 59 + i + 1;
//         const s = j + 1;

//         if (s > keys.length) {
//           break_flg = false;
//           break;
//         }

//         if (len !== null) {
//           line.push(len.toFixed(3));
//         } else {
//           line.push("");
//         }

//         let counter: number = 0;
//         for (const key of Object.keys(item.Points)) {
//           line.push(item.Points[key].toFixed(3));
//           counter += 1;
//           if (counter === 9) {
//             body.push(line); // 表の1行 登録
//             counter = 0;
//             line = new Array();
//             line.push(""); // 部材No
//             line.push(""); // 部材長
//           }
//         }
//         if (counter > 0) {
//           body.push(line); // 表の1行 登録
//         }
//       }

//       if (body.length === 0) {
//         break;
//       }
//       splid.push(body);
//       body = [];
//       page++;
//     }

//     //最後のページの行数だけ取得している
//     const lastArray = splid.slice(-1)[0];
//     const lastArrayCount = lastArray.length;

//     //全部の行数を取得している。
//     this.countTotal = keys.length;

//     return { page, splid, this: this.countTotal, last: lastArrayCount };
//   }
// }
