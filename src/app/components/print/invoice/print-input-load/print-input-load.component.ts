import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { AfterViewInit } from "@angular/core";
import { DataCountService } from "../dataCount.service";
import { Data } from "@angular/router";

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
  countCell: number;
  countHead: number;
  countTotal: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public load_title = [];
  public load_member = [];
  public load_node = [];

  public judge_actual: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge_actual = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);
    const LoadJson: any = this.InputData.load.getLoadJson();
    if (Object.keys(LoadJson).length > 0) {
      // 実荷重データ
      const tables_actual = this.printLoad(LoadJson);
      this.load_title = tables_actual.titleSum;
      this.load_member = tables_actual.memberSum;
      this.load_node = tables_actual.nodeSum;
      this.judge_actual = this.countArea.setCurrentY(tables_actual.actual);
    }
  }

  ngAfterViewInit(){}

  // 基本荷重データ load name を印刷する

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
      this.countCell = (mloadCount + 1) * 20 + (ploadCount + 1) * 20;
      titleSum.push(title);
      memberSum.push(memberData);
      nodeSum.push(nodeData);
      countCellSum = countCellSum + this.countCell;
    }
    this.countHead = keys.length * 2 * 20;
    this.countTotal = countCellSum + this.countHead + 40;
    return { titleSum, memberSum, nodeSum, actual: this.countTotal };
  }
}
