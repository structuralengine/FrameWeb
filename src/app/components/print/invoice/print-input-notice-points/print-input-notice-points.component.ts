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
  countTotal: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public judge: boolean;

  public notice_dataset = [];

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("notice_points" in inputJson) {
      const tables = this.printNoticepoints(inputJson); // {body, title}
      this.notice_dataset = tables.body;
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  // 着目点データ notice_points を印刷する
  private printNoticepoints(inputJson): any {
    let printAfterInfo: any;
    const json: {} = inputJson["notice_points"];
    const body: any = [];
    const keys: string[] = Object.keys(json);

    for (const index of keys) {
      const item = json[index]; // 1行分のnodeデータを取り出す

      // 印刷する1行分のリストを作る
      let line: string[] = new Array();
      line.push(item.m); // 部材No
      const len: number = this.InputData.member.getMemberLength(item.m); // 部材長
      if (len !== null) {
        line.push(len.toFixed(3));
      } else {
        line.push("");
      }

      let counter: number = 0;
      for (const key of Object.keys(item.Points)) {
        line.push(item.Points[key].toFixed(3));
        counter += 1;
        if (counter === 9) {
          body.push(line); // 表の1行 登録
          counter = 0;
          line = new Array();
          line.push(""); // 部材No
          line.push(""); // 部材長
        }
      }
      if (counter > 0) {
        body.push(line); // 表の1行 登録
      }
    }
    this.countTotal = ( keys.length * 2 + 1) * 20 + 40;
    return { body, this:this.countTotal };
  }
}
