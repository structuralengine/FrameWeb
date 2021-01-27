import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
// import { table } from "console";

@Component({
  selector: "app-print-input-nodes",
  templateUrl: "./print-input-nodes.component.html",
  styleUrls: [
    "./print-input-nodes.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputNodesComponent implements OnInit, AfterViewInit {
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

  public node_dataset = [];
  public node_page = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {}

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    if ("node" in inputJson) {
      const tables = this.printNode(inputJson);
      this.node_dataset = tables.splid;
      this.node_page = tables.page;
      // if (tables.splid > 0) {
      //   this.node_splid = tables.splid;
      // } else {
      //   this.node_splid = [1];
      // }
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit() {}

  // 格子点データ node を印刷する
  private printNode(inputJson): any {
    const minCount: number = 52; // これ以上なら２行書きとする
    let body: any = [];
    const splid: any = [];
    let m: number = 0;
    let page: number = 0;
    const json: {} = inputJson["node"]; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);

    let head: string[];

    let break_flg = true;
    while (break_flg) {
      for (let i = 0; i < 54; i++) {
        const line = ["", "", "", "", "", "", "", ""];

        const j = page * 108 + i; //0, 108, 216, ...
        if(j===289){
          console.log('')
        }
        if (j > keys.length) {
          break_flg = false;
          break;
        }
        const index1: string = keys[j];
        const item1 = json[index1];
        line[0] = index1;
        line[1] = item1.x.toFixed(3);
        line[2] = item1.y.toFixed(3);
        line[3] = item1.z.toFixed(3);

        const k = j + 54;
        if (k < keys.length) {
          const index2: string = keys[k];
          const item2 = json[index2];
          line[4] = index2;
          line[5] = item2.x.toFixed(3);
          line[6] = item2.y.toFixed(3);
          line[7] = item2.z.toFixed(3);
        }
        body.push(line);
      }
      
      if(body.length === 0){
        break;
      }
      splid.push(body);
      body = [];
      page++;
    }

    this.countTotal = (keys.length + 1) * 20 + 40;
    return { page, splid, this: this.countTotal };
  }
}
