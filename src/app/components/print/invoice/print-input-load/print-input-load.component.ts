import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { PrintInputLoadService } from "./print-input-load.service";

@Component({
  selector: "app-print-input-load",
  templateUrl: "./print-input-load.component.html",
  styleUrls: [
    "./print-input-load.component.scss",
    "../../../../app.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintInputLoadComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  countCell1: number;
  countTotal1: number;
  countCell2: number;
  countHead2: number;
  countTotal2: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public loadName_dataset = [];
  public load_title = [];
  public load_member = [];
  public load_node = [];

  public judge_basic: boolean;
  public judge_actual: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: PrintInputLoadService
  ) {
    this.judge_basic = false;
    this.judge_actual = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);

    const LoadJson: any = this.InputData.load.getLoadJson();
    if (Object.keys(LoadJson).length > 0) {
      // 基本荷重データ
      const tables_basic = this.printLoadName(LoadJson);
      this.loadName_dataset = tables_basic.body;
      this.judge_basic = this.countArea.setCurrentY_basic(tables_basic.basic);

      // 実荷重データ
      const tables_actual = this.printLoad(LoadJson);
      // title, memberData, nodeData
      this.load_title = tables_actual.titleSum;
      this.load_member = tables_actual.memberSum;
      this.load_node = tables_actual.nodeSum;
      this.judge_actual = this.countArea.setCurrentY_actual(
        tables_actual.actual
      );
    }
  }

  ngAfterViewInit() {}

  // 基本荷重データ load name を印刷する
  private printLoadName(json): any {
    const body: any = [];
    const dataCount: number = Object.keys(json).length;
    for (const index of Object.keys(json)) {
      const item = json[index]; // 1行分のnodeデータを取り出す
      /*let rate: number
      if(item.rate !== null){
        rate = item.rate;
      } else {
        rate = 1;
      } */
      const rate: number = item.rate !== null ? item.rate : 1;
      const fix_node: number = item.fix_node !== null ? item.fix_node : 1;
      const fix_member: number = item.fix_member !== null ? item.fix_member : 1;
      const element: number = item.element !== null ? item.element : 1;
      const joint: number = item.joint !== null ? item.joint : 1;

      // 印刷する1行分のリストを作る
      const line: any[] = new Array();
      line.push(index);
      line.push(rate.toFixed(4));
      line.push(item.symbol);
      line.push(item.name);
      line.push(fix_node.toString());
      line.push(fix_member.toString());
      line.push(element.toString());
      line.push(joint.toString());
      body.push(line);
    }
    this.countTotal1 = (dataCount * 2 + 1) * 20 + 40;
    return { body, basic: this.countTotal1 };
  }

  // 実荷重データ load 部材荷重 を印刷する
  private printLoad(json): any {
    const keys: string[] = Object.keys(json);
    const titleSum: any = [];
    const memberSum: any = [];
    const nodeSum: any = [];
    let countCellSum: number = 0;

    // const title: string[] = new Array();

    for (const index of keys) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      //データ数が0かどうかの判定
      const memberData: any = [];
      const nodeData: any = [];
      const title: any = [];

      let mloadCount: number = 0;
      if ("load_member" in elist) {
        mloadCount = elist.load_member.length;
      }

      let ploadCount: number = 0;
      if ("load_node" in elist) {
        ploadCount = elist.load_node.length;
      }

      if (mloadCount <= 0 && ploadCount <= 0) {
        continue; // 印刷すべきデータがなければ スキップ
      }

      // タイトル
      title.push(["Case " + index, elist.name]);

      //部材荷重
      if (mloadCount > 0) {
        for (const item of elist.load_member) {
          // 印刷する1行分のリストを作る
          const line: string[] = new Array();
          line.push("");
          line.push(item.m1);
          line.push(item.m2);
          line.push(item.direction);
          line.push(item.mark);
          line.push(item.L1);
          line.push(item.L2);
          line.push(item.P1 === null ? "" : item.P1.toFixed(2));
          line.push(item.P2 === null ? "" : item.P2.toFixed(2));
          memberData.push(line);
        }
      }

      // 節点荷重
      if (ploadCount > 0) {
        for (const item of elist.load_node) {
          const tx = item.tx !== null ? item.tx : 0;
          const ty = item.ty !== null ? item.ty : 0;
          const tz = item.tz !== null ? item.tz : 0;
          const rx = item.rx !== null ? item.rx : 0;
          const ry = item.ry !== null ? item.ry : 0;
          const rz = item.rz !== null ? item.rz : 0;

          // 印刷する1行分のリストを作る
          const line: string[] = new Array();
          line.push("");
          line.push(item.n.toString());
          line.push(tx.toFixed(2));
          line.push(ty.toFixed(2));
          line.push(tz.toFixed(2));
          line.push(rx.toFixed(2));
          line.push(ry.toFixed(2));
          line.push(rz.toFixed(2));
          nodeData.push(line);
        }
      }
      this.countCell2 = ((mloadCount + 1) * 20) + ((ploadCount + 1) * 20);
      titleSum.push(title);
      memberSum.push(memberData);
      nodeSum.push(nodeData);
      countCellSum = countCellSum + this.countCell2;
    }
    this.countHead2 = keys.length * 2 * 20;
    this.countTotal2 = countCellSum + this.countHead2 + 40;
    return { titleSum, memberSum, nodeSum, actual: this.countTotal2 };
  }
}
