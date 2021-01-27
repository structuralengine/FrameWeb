import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service"
import { Data } from "@angular/router";

@Component({
  selector: "app-print-input-joint",
  templateUrl: "./print-input-joint.component.html",
  styleUrls: [
    "./print-input-joint.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputJointComponent implements OnInit, AfterViewInit {
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

  public joint_dataset = [];
  public joint_typeNum = [];

  public judge: boolean;

  constructor(private InputData: InputDataService,
    private countArea: DataCountService ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("joint" in inputJson) {
      const tables = this.printjoint(inputJson); // {body, title}
      this.joint_dataset = tables.body;
      this.joint_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  // 結合データ を印刷する
  private printjoint(inputJson): any {
    const json: {} = inputJson["joint"];
    const body: any = [];
    const keys: string[] = Object.keys(json);
    // const table: any = []; // 下に移動
    const title: string[] = new Array();
    for (const index of keys) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      title.push(index.toString());
      const table: any = []; // この時点でリセット、再定義 一旦空にする
      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る

        const line: string[] = new Array();
        line.push(item.m);
        line.push(item.xi.toString());
        line.push(item.yi.toString());
        line.push(item.zi.toString());
        line.push(item.xj.toString());
        line.push(item.yj.toString());
        line.push(item.zj.toString());
        table.push(line);
      }
      this.countCell = (elist.length + 1) * 20;
      body.push(table);
    }
    this.countHead = keys.length * 2 * 20;
    this.countTotal = this.countCell + this.countHead + 40;
    return { body, title, this: this.countTotal };
  }
}
