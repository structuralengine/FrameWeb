import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";

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
  collectionSize: number;
  countCell: number;
  countHead: number;
  countTotal: number;

  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public elements_dataset = [];
  public elements_typeNum = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("element" in inputJson) {
      const tables = this.printElement(inputJson); // {body, title}
      this.elements_dataset = tables.body;
      this.elements_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  // 材料データ element を印刷する
  private printElement(inputJson): any {
    const json: {} = inputJson["element"]; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);
    const body: any = [];
  

    const title: string[] = new Array();
    for (const index of keys) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      console.log("elist.length",Object.keys(elist).length);
      title.push(index.toString());
      const table: any = []; // この時点でリセット、再定義 一旦空にする
      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る

        const line: string[] = new Array();
        line.push(key);
        line.push(item.A.toFixed(4));
        line.push(item.E.toExponential(2));
        line.push(item.G.toExponential(2));
        line.push(item.Xp.toExponential(2));
        line.push(item.Iy.toFixed(6));
        line.push(item.Iz.toFixed(6));
        line.push(item.J.toFixed(4));
        table.push(line);
      }
      this.countCell = (Object.keys(elist).length + 1) * 20;
      body.push(table);
    }
    this.countHead = keys.length * 2 * 20;
    this.countTotal = this.countCell + this.countHead + 40;
    return { body, title, this: this.countTotal };
  }
}
