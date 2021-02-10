import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-define",
  templateUrl: "./print-input-define.component.html",
  styleUrls: [
    "./print-input-define.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputDefineComponent implements OnInit, AfterViewInit {
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

  public define_dataset = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    countArea.dataExists[9] = true;
    this.clear();
  }

  public clear(): void{
    this.define_dataset = new Array();
}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    const defineJson: any = this.InputData.define.getDefineJson();
    if (Object.keys(defineJson).length > 0) {
      const tables = this.printDefine(defineJson);
      this.define_dataset = tables.splid;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    }else {
      this.countArea.setData(9);
    }
  }

  ngAfterViewInit() {}

  // DEFINEデータ  を印刷する
  private printDefine(json): any {
    //let printAfterInfo: any;

    const dataCount: number = Object.keys(json).length;
    let row: number;
    let body: any[] = new Array();

    // 全部の行数を取得している
    this.countTotal = dataCount;

    const splid: any[] = new Array();
    for (const index of Object.keys(json)) {
      if (index === "1") {
        row = 3;
      } else {
        row = 1;
      }
      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      line.push(index); // DefineNo
      let counter: number = 0;

      for (const key of Object.keys(item)) {
        //  if (key === 'row') { continue; }
        line.push(item[key]);
        counter += 1;
        if (counter === 10) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(""); // DefineNo
          row++;
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
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

    //最後のページの行数だけ取得している
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length;

    return { splid, this: this.countTotal, last: lastArrayCount };
  }
}
