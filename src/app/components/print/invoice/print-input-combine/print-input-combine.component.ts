import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-combine",
  templateUrl: "./print-input-combine.component.html",
  styleUrls: [
    "./print-input-combine.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputCombineComponent implements OnInit, AfterViewInit {
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

  public comb_tables = [];
  public comb_dataset = [];
  public comb_page = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    this.comb_tables = [];
    const inputJson: any = this.InputData.getInputJson(0);

    const combineJson: any = this.InputData.combine.getCombineJson();
    if (Object.keys(combineJson).length > 0) {
      const tables = this.printCombine(combineJson);
      this.comb_dataset = tables.splid;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    }else {
      this.countArea.setData(9);
    }
  }

  ngAfterViewInit() {}

  // COMBINEデータ  を印刷する
  private printCombine(json): any {
    let body: any = [];
    let page: number = 0;
    // const temp =  this.InputData.combine.getCombineJson();// inputJsonからnodeだけを取り出す
    // const json1 = {};
    // let i = 1;

    // while (json1.length < Object.keys(json).length) {
    //   const item = temp.find((element) => element["row"] === i);
    //   if (item !== undefined) {
    //     json1.push(item);
    //   }
    //   i++;
    // }

    // テストコード
    // for(let i = 3; i < 10; i++){
    //   const temp = json['1'];
    //   const key = i.toString();
    //   temp['row'] =i
    //   for(let j = 1; j < i; j++){
    //     const Ckey = 'C' + key;
    //     temp[ Ckey] = j
    //   }
    //   json[key] = temp;
    // }

    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;
    const splid: any = [];
    let row: number;

    for (const index of Object.keys(json)) {
      if (index === "1") {
        row = 3;
      } else {
        row = 2;
      }

      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line1: any[] = new Array();
      let line2: string[] = new Array();
      line1.push(index); // CombNo
      line2.push("");
      if ("name" in item) {
        line1.push(item.name); // 荷重名称
      } else {
        line1.push("");
      }
      line2.push("");

      if (index == "1") {
        console.log("2番目の処理が正常に完了");
        console.log("1", line1);
      }

      let counter: number = 0;
      for (const key of Object.keys(item)) {
        if (key === "row") {
          continue;
        }
        if (key === "name") {
          continue;
        }
        line1.push(key.replace("C", ""));
        line2.push(item[key]);
        counter += 1;
        if (counter === 10) {
          body.push(line1); // 表の1行 登録
          body.push(line2);
          counter = 0;
          line1 = new Array();
          line2 = new Array();
          line1.push(""); // CombNo
          line2.push("");
          line1.push(""); // 荷重名称
          line2.push("");
          row++;
        }
      }
      if (counter > 0) {
        body.push(line1); // 表の1行 登録
        body.push(line2);
      }

      //１テーブルで59行以上  になったら
      if (row > 59) {
        splid.push(body);
        body = [];
        row = 2;
      }

      row++;
    }
    if (body.length > 0) {
      splid.push(body);
    }

    this.countTotal = dataCount * 2;

    //最後のページの行数だけ取得している
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length;
    return { splid, this: this.countTotal, last: lastArrayCount };
  }
}
