import { Component, OnInit } from "@angular/core";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { PrintService } from "../../print.service";

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
  isEnable = false;
  page: number;
  load_name: string;
  countCell: number = 0;
  countHead: number = 0;
  countTotal: number = 0;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public define_dataset = [];

  public judge: boolean;

  constructor(
    private printService: PrintService,
    private countArea: DataCountService
  ) {
    this.judge = false;
    this.clear();
  }

  public clear(): void {
    this.define_dataset = new Array();
  }

  ngOnInit(): void {
    const defineJson: any = this.printService.defineJson;
    if (Object.keys(defineJson).length > 0) {
      const tables = this.printDefine(defineJson);
      this.define_dataset = tables.splid;
      this.judge = this.countArea.setCurrentY(tables.this, tables.last);
    } else {
      this.isEnable = false;
    }
  }

  ngAfterViewInit() {}

  // DEFINEデータ  を印刷する
  private printDefine(json): any {
    //let printAfterInfo: any;

    let row: number;
    let body: any[] = new Array();

    const splid: any[] = new Array();
    for (const index of Object.keys(json)) {
      if (index === "1") {
        row = 5;
      } else {
        row = 2;
      }
      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      // line.push(index); // DefineNo
      let counter: number = 0;
      let kk = Object.keys(item);
      const iid = kk[0];
      line.push(item[iid]);
      kk.sort();

      for (let ii = 0; ii < kk.length - 1; ii++) {
        const key = kk[ii];
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
      if (row > 54) {
        splid.push(body);
        body = [];
        row = 2;
      }
      row++;
    }
    if (body.length > 0) {
      splid.push(body);
    }

    // 全部の行数を取得している
    let countCell = 0;
    countCell = Object.keys(json).length;
    if (countCell === 0) {
      this.countHead = 0;
    } else if (countCell > 0) {
      this.countHead = Math.floor((countCell / 54) * 2) + 2;
    }
    this.countTotal = countCell + this.countHead + 3;

    //最後のページの行数だけ取得している
    const lastArrayCount = this.countTotal % 54;

    return { splid, this: this.countTotal, last: lastArrayCount };
  }
}
