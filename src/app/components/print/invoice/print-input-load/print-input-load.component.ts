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
    let page_over_member: number = 0;
    let page_over_node: number = 0;
    
    let countCell_member: number = 0;
    let countCell_node: number = 0;

    let lenlenMember: number = 0;
    let lenlenNode: number = 0;

    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      if (index === "20") {
        console.log("fdas");
      }

      if ("load_member" in elist) {
        countCell_member = elist.load_member.length;
        if (countCell_member > 60) {
          page_over_member = Math.floor(countCell_member / 60);
          ROW_m = countCell_member + Math.floor(countCell_member / 60) * 3;
        } else {
          ROW_m = countCell_member + 3;
        }
      } else {
        ROW_m = 0;
      }

      if ("load_node" in elist) {
        countCell_node = elist.load_node.length;
        if (countCell_node > 60) {
          page_over_node = Math.floor(countCell_node / 60);
          ROW_n = countCell_node + page_over_node * 2;
        } else {
          ROW_n = countCell_node + 2;
        }
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
        let reROW = ROW_m + ROW_n;
        ROW_mn = (reROW % 57) + 7;
      }
    }

    // 実際のデータを作成する
    let TotalDataCount: number = 0;
    let mloadCount: number = 0;
    let ploadCount: number = 0;

    let mload: any = [];
    let pload: any = [];
    const splidDataTotal: any = [];

    lenlenMember = 0;

    for (const index of keys) {
      const splidData_member: any = [];
      const splidData_node: any = [];
      const splidData_part: any = [];
      const memberTable: any = [];
      const nodeTable: any = [];

      let row: number;
      if (index === "1") {
        row = 4;
      } else {
        row = 2;
      }

      console.log(index + "番目まで終わり");
      const elist = json[index]; // 1テーブル分のデータを取り出す

      // タイトルを表示させる。
      splidData_part.push(["Case " + index, elist.name]);

      // 全体の高さを計算する
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

      // テーブル

      // 部材荷重
      if (mloadCount > 0) {
        mload = [];
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
          mload.push(line);
          // flg.push(0);
          row++;
          //１テーブルで60行以上データがあるならば
          if (row > 59) {
            splidData_member.push(mload);
            mload = [];
            row = 3;
          }
        }
        if (mload.length > 0) {
          splidData_member.push(mload);
          lenlenMember = mload.slice(-1)[0].length + 3;
          row = lenlenMember;
        }
        memberTable.push(splidData_member);
      }
      row = 3 + lenlenMember;

      // 節点荷重
      if (ploadCount > 0) {
        pload = [];
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
          pload.push(line);
          row++;

          //１テーブルで60行以上データがあるならば
          if (row > 59) {
            splidData_node.push(pload);
            pload = [];
            row = 3;
          }
        }

        if (pload.length > 0) {
          splidData_node.push(pload);
          lenlenNode = pload.slice(-1)[0] + 3;
        }
        nodeTable.push(splidData_node);
        console.log(nodeTable);
      }
      // タイトル、member、nodeをそれぞれの配列として格納する
      splidData_part.push(memberTable, nodeTable);

      //splidData_partに格納したデータをcaseごとに包含する
      splidDataTotal.push(splidData_part);

      if (mloadCount === 0 && ploadCount === 0) {
        continue;
      }
    }

    let countHead = keys.length * 2;
    const countTotal = TotalDataCount + countHead;

    //最後のページにどれだけデータが残っているかを求める
    const lastSplid = splidDataTotal.slice(-1)[0];
    const lastArray = lastSplid.slice(-1)[0];
    const lastArrayCount = lastArray.length;

    return {
      tableData: splidDataTotal, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      this: countTotal, // 全体の高さ
      last: lastArrayCount, //最後のページのcurrentYの行数
      break_after: break_after, // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };
  }
}
