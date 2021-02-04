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
  countTotal: number = 2;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public load_title = [];
  public load_member = [];
  public load_node = [];

  public load_data = [];
  public load_flg = [];
  public load_break = [];
  public load_typeNum = [];

  public load_titleArray = [];

  public judge: boolean;

  constructor(
    private InputData: InputDataService,
    private countArea: DataCountService
  ) {
    this.judge = false;
  }

  ngOnInit(): void {
    const inputJson: any = this.InputData.getInputJson(0);
    const LoadJson: any = this.InputData.load.getLoadJson();
    if (Object.keys(LoadJson).length > 0) {
      // 実荷重データ
      const tables_actual = this.printLoad(LoadJson);
      this.load_data = tables_actual.tableData;
      this.load_titleArray = tables_actual.titleArrayLength;
      this.load_break = tables_actual.break_after;
      this.judge = this.countArea.setCurrentY(
        tables_actual.this,
        tables_actual.last
      );
    }
  }

  ngAfterViewInit() {}

  // 実荷重データ load 部材荷重 を印刷する
  private printLoad(json): any {
    const keys: string[] = Object.keys(json);

    // 各タイプの前に改ページ（break_after）が必要かどうか判定する
    const break_after: boolean[] = new Array();
    let ROW_mn = 1; //member+nodeによる改ページ判定
    let ROW_m: number; //member全部の行数
    let ROW_n: number; //node全部の行数
    let b: number = 0;
    let c: number = 0;
    let d: number = 0;
    let e: number = 0;
    let countCell_member: number = 0;
    let countCell_node: number = 0;

    let lenlenMember: number = 0;
    let rowMember: number = 0;
    let lenlenNode: number = 0;
    let rowNode: number = 0;

    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      if (index === "20") {
        console.log("fdas");
      }

      if ("load_member" in elist) {
        countCell_member = elist.load_member.length;
        if (countCell_member > 60) {
          b = Math.floor(countCell_member / 60);
          c = countCell_member + b * 3;
        } else {
          b = countCell_member;
          c = countCell_member + 3;
        }
        ROW_m = c;
      } else {
        ROW_m = 0;
      }

      if ("load_node" in elist) {
        countCell_node = elist.load_node.length;
        if (countCell_node > 60) {
          d = Math.floor(countCell_node / 60);
          e = countCell_node + b * 3;
        } else {
          d = countCell_node;
          e = countCell_node + 3;
        }
        ROW_n = e;
      } else {
        ROW_n = 0;
      }

      ROW_mn += ROW_m + ROW_n;

      if (ROW_mn < 63) {
        break_after.push(false);
        ROW_mn = ROW_mn + 1;
        ROW_m = 0;
        ROW_n = 0;
      } else if (ROW_mn === 63) {
        break_after.push(false);
        ROW_mn = 65;
        ROW_m = 0;
        ROW_n = 0;
      } else {
        if (index === "1") {
          break_after.push(false);
        } else {
          break_after.push(true);
        }
        ROW_mn = 0;
        let de = ROW_m + ROW_n;
        let r = (de % 57) + 6;
        ROW_mn = r + 1;
        // let r = (ROW_mn % 57) + 6;
        //   ROW_mn = r + 1;
        //   ROW_m = 0;
        //   ROW_n = 0;
        // if (ROW_m === 0) {
        //   ROW_mn = ROW_mn % 57;
        // } else if (ROW_n === 0) {
        //   let b = Math.floor(ROW_m / 61);
        //   let c = ROW_m + b * 3;

        //   ROW_mn = ROW_mn % 57;
        // } else {
        //   ROW_mn = ROW_mn % 57;
        //   ROW_m = 0;
        //   ROW_n = 0;
        // }
      }
    }

    // 全体の高さを計算する
    let TotalDataCount: number = 0;
    let mloadCount: number = 0;
    let ploadCount: number = 0;

    let body: any = [];
    let data1: any = [];
    let data2: any = [];
    let ROWSum: number = 0;
    const splidDataTotal: any = [];

    //let flg: any = [];
    //const splidFlg: any = [];
    const title: any = [];
    let lenArray: any = [];

    lenlenMember = 0;

    for (const index of keys) {
      const splidData_member: any = [];
      const splidData_node: any = [];
      const splidData_part: any = [];
      const memberTable: any = [];
      const nodeTable: any = [];

      let row = 2; // タイトル行
      console.log(index + "番目まで終わり");
      const elist = json[index]; // 1テーブル分のデータを取り出す

      splidData_part.push(["Case " + index, elist.name]);
      if ("load_member" in elist) {
        mloadCount = elist.load_member.length;
      } else {
        mloadCount = 0;
      }

      if ("load_node" in elist) {
        ploadCount = elist.load_node.length;
      } else {
        ploadCount = 0;
      }

      TotalDataCount += mloadCount + ploadCount + 2;

      //title.push(["Case " + index, elist.name]);

      // テーブル

      // 部材荷重
      if (mloadCount > 0) {
        data1 = [];
        for (const item of elist.load_member) {
          const line = ["", "", "", "", "", "", "", ""];
          line[0] = item.m1;
          line[1] = item.m2;
          line[2] = item.direction;
          line[3] = item.mark;
          line[4] = item.L1;
          line[5] = item.L2;
          line[6] = item.P1 === null ? "" : item.P1.toFixed(2);
          line[7] = item.P2 === null ? "" : item.P1.toFixed(2);
          data1.push(line);
          // flg.push(0);
          row++;
          //１テーブルで59行以上データがあるならば
          if (row > 59) {
            splidData_member.push(data1);
            //splidFlg.push(flg);
            data1 = [];
            // flg = [];
            row = 3;
          }
        }
        console.log(row, "row1");
        // row = 3;
        console.log(row, "row2");
        if (data1.length > 0) {
          splidData_member.push(data1);
          //splidFlg.push(flg);
          lenlenMember = data1.slice(-1)[0].length + 3;
          row = lenlenMember;
        }
        memberTable.push(splidData_member);
      }
      console.log(row, "row3");
      row = 3 + lenlenMember;
      console.log(row, "row4");

      // 節点荷重
      if (ploadCount > 0) {
        data2 = [];
        for (const item of elist.load_node) {
          const tx = item.tx !== null ? item.tx : 0;
          const ty = item.ty !== null ? item.ty : 0;
          const tz = item.tz !== null ? item.tz : 0;
          const rx = item.rx !== null ? item.rx : 0;
          const ry = item.ry !== null ? item.ry : 0;
          const rz = item.rz !== null ? item.rz : 0;

          const line = ["", "", "", "", "", "", "", ""];
          line[0] = "";
          line[1] = item.n.toString();
          line[2] = tx.toFixed(2);
          line[3] = ty.toFixed(2);
          line[4] = tz.toFixed(2);
          line[5] = rx.toFixed(2);
          line[6] = ry.toFixed(2);
          line[7] = rz.toFixed(2);
          data2.push(line);
          //   flg.push(1);
          row++;
          //１テーブルで59行以上データがあるならば
          if (row > 59) {
            splidData_node.push(data2);
            //splidFlg.push(flg);
            data2 = [];
            //flg = [];
            row = 3;
          }
        }

        if (data2.length > 0) {
          splidData_node.push(data2);
          lenlenNode = data2.slice(-1)[0] + 3;
        }
        nodeTable.push(splidData_node);
        console.log(nodeTable);
      }

      // if (data.length > 0) {
      //   splidData.push(data);
      //   splidFlg.push(flg);
      //   data = [];
      //   flg = [];
      // }

      // lenArray.push(splidData.length - 1);

      splidData_part.push(memberTable, nodeTable);
      splidDataTotal.push(splidData_part);

      // タイトル
      // splidData0.push(["Case " + index, elist.name]);

      if (mloadCount === 0 && ploadCount === 0) {
        continue;
      }

      // let ROWSum = row;

      // //１テーブルで59行以上データがあるならば
      // if (ROWSum > 59) {
      //   splid1.push(memberData);
      //   splid2.push(nodeData);
      //   memberData = [];
      //   nodeData = [];
      //   row = 2;
      // }
    }

    let countHead = keys.length * 2;
    const countTotal = TotalDataCount + countHead;

    const lastSplid = splidDataTotal.slice(-1)[0];
    const lastArray = lastSplid.slice(-1)[0];
    const lastArrayCount = lastArray.length;

    return {
      tableData: splidDataTotal, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      // tableFlg: splidFlg,
      //title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      titleArrayLength: lenArray,
      last: lastArrayCount, //最後のページのcurrentYの行数
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
