import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

@Component({
  selector: "app-print-input-pickup",
  templateUrl: "./print-input-pickup.component.html",
  styleUrls: [
    "./print-input-pickup.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputPickupComponent implements OnInit, AfterViewInit {
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

  public pickup_dataset = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    const pickupJson: any = this.InputData.pickup.getPickUpJson();
    if (Object.keys(pickupJson).length > 0) {
      const tables = this.printPickup(pickupJson);
      this.pickup_dataset = tables.body;
      this.judge = this.countArea.setCurrentY(tables.this,
        tables.last
         );
    }
  }

  ngAfterViewInit() {}

  // PICKUEデータ  を印刷する
  private printPickup(json): any {
    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;
    const keys: string[] = Object.keys(json);
    const body: any = [];
    const splid: any = [];
    for (const index of keys) {
      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: any[] = new Array();
      line.push(index); // PickUpNo
      if ("name" in item) {
        line.push(item.name); // 荷重名称
      } else {
        line.push("");
      }

      let counter: number = 0;
      for (const key of Object.keys(item)) {
        if (key === "row") {
          continue;
        }
        if (key === "name") {
          continue;
        }
        line.push(item[key]);
        counter += 1;
        if (counter === 10) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(""); // PickUpNo
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
      }
    }
    this.countTotal = keys.length * 2;

    //最後のページの行数だけ取得している
    const lastArray = splid.slice(-1)[0];
    const lastArrayCount = lastArray.length;

    return { body, this: this.countTotal, last: lastArrayCount };
  }
}
