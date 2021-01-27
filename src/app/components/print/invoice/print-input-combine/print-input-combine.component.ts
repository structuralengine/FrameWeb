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
  countTotal: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public comb_tables = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    this.comb_tables =[];
    const inputJson: any = this.InputData.getInputJson(0);

    const combineJson: any = this.InputData.combine.getCombineJson();
    if (Object.keys(combineJson).length > 0) {
      let comb_dataset = [];

      const tables = this.printCombine(combineJson);
      let row = 0;
      for(const line of tables.body) {
        comb_dataset.push(line);
        row ++;
        if ( row > 60){ // とりあえず60行超えたらとする
          this.comb_tables.push(comb_dataset);
          comb_dataset = [];
          row = 0;
        }
      }
      if(comb_dataset.length > 0){
        this.comb_tables.push(comb_dataset);
      } 

      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  // COMBINEデータ  を印刷する
  private printCombine(json): any {

    // テストコード
    for(let i = 3; i < 10; i++){
      const temp = json['1'];
      const key = i.toString();
      temp['row'] =i
      for(let j = 1; j < i; j++){
        const Ckey = 'C' + key;
        temp[ Ckey] = j
      }
      json[key] = temp;
    }


    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;

    const body: any = [];
    for (const index of Object.keys(json)) {
      const item = json[index]; // 1行分のnodeデータを取り出す

      if (index == "3") {
        console.log("2番目の処理が正常に完了");
      }

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
        if (counter === 8) {
          body.push(line1); // 表の1行 登録
          body.push(line2);
          counter = 0;
          line1 = new Array();
          line2 = new Array();
          line1.push(""); // CombNo
          line2.push("");
          line1.push(""); // 荷重名称
          line2.push("");
        }
      }
      if (counter > 0) {
        body.push(line1); // 表の1行 登録
        body.push(line2);
      }
    }
    this.countTotal = (dataCount * 2 + 1) * 20 + 40;
    return { body, this: this.countTotal };
  }
}
