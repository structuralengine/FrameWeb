import { Component, OnInit } from "@angular/core";
import { InputDataService } from "../../../../providers/input-data.service";
import { ResultDataService } from "../../../../providers/result-data.service";
import { AfterViewInit } from "@angular/core";
import { JsonpClientBackend } from "@angular/common/http";

@Component({
  selector: "app-print-result-combine-disg",
  templateUrl: "./print-result-combine-disg.component.html",
  styleUrls: [
    "../../../../app.component.scss",
    "../invoice.component.scss",
    "../invoice.component.scss",
  ],
})
export class PrintResultCombineDisgComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public combDisg_dataset = [];
  public combDisg_title = [];
  public combDisg_type = [];

  constructor(
    private InputData: InputDataService,
    private ResultData: ResultDataService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.combdisg.disgCombine;
    const tables = this.printCombDisg(resultjson);
    this.combDisg_dataset = tables.body;
    this.combDisg_title = tables.titleSum;
    this.combDisg_type = tables.typeSum;
  }

  // 変位量データを印刷する
  private printCombDisg(json): any {
    const titleSum: any = [];
    let body: any[] = new Array();
    const typeSum: any = [];

    const KEYS = [
      "dx_max",
      "dx_min",
      "dy_max",
      "dy_min",
      "dz_max",
      "dz_min",
      "rx_max",
      "rx_min",
      "ry_max",
      "ry_min",
      "rz_max",
      "rz_min",
    ];

    const keys: string[] = Object.keys(json);

    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      countCell += Object.keys(elist).length + 1;
    }

    const countHead = keys.length * 2;
    const countTotal = countCell + countHead + 2;

    //　各ケースの前に改ページ(break_after)が必要かどうかを判定する。
    // const break_after_case: boolean[] = new Array();
    // let ROW_case = 0;
    // for (const index of keys) {
    //   ROW_case += 2; // 行
    //   const elist = json[index]; // 1テーブル分のデータを取り出す
    //   const elieli = json[index]; // 1行分のnodeデータを取り出す
    //   const countCell_type = Object.keys(elieli).length;
    //   ROW_case += countCell;

    //   if (ROW_case < 59) {
    //     break_after_case.push(false);
    //   } else {
    //     if (index === "1") {
    //       break_after_case.push(false);
    //     } else {
    //       break_after_case.push(true);
    //     }
    //     ROW_case = 0;
    //   }
    // }

    //　各荷重状態の前に改ページ(break_after)が必要かどうかを判定する。
    const break_after_case: boolean[] = new Array();
    const break_after_type: boolean[] = new Array();
    let ROW_type = 1; // 行
    let ROW_case = 0;
    for (const index of Object.keys(json)) {
      for (let i = 0; i < KEYS.length; i++) {
        const key: string = KEYS[i];
        const elieli = json[index]; // 1行分のnodeデータを取り出す
        const elist = elieli[key]; // 1行分のnodeデータを取り出す.
        const countCell_type =
          Object.keys(elist).length + Object.keys(elieli).length;

        ROW_type += countCell;

        if (ROW_type < 59) {
          break_after_type.push(false);
        } else {
          if (index === "1") {
            break_after_type.push(false);
          } else {
            break_after_type.push(true);
          }
          ROW_type = 0;
        }
        const countCell_case = Object.keys(json).length + countCell_type;
        ROW_type += countCell_case;
        if (ROW_case < 59) {
          break_after_case.push(false);
        } else {
          if (index === "1") {
            break_after_case.push(false);
          } else {
            break_after_case.push(true);
          }
          ROW_case = 0;
        }
      }

      //　テーブル
      const splid: any = [];
      const titleSum: string[] = new Array();
      let row: number = 0;
      for (const index of keys) {
        if (index === "1") {
          row = 3;
        } else {
          row = 2;
        }
        const elist = json[index]; // 1テーブル分のデータを取り出す
        const table: any = []; // この時点でリセット、再定義 一旦空にする
        const typeName: any = [];

        // 荷重名称
        const title: any = [];
        let loadName: string = "";
        //const l: any = this.InputData.load.getLoadNameJson(null, index);
        const combineJson: any = this.InputData.combine.getCombineJson();
        if (index in combineJson) {
          if ("name" in combineJson[index]) {
            loadName = combineJson[index].name;
            title.push(["Case" + index, loadName]);
          } else {
            title.push(["Case" + index]);
          }
        }
        titleSum.push(title);
        //   const title: string = TITLES[i];

        //   let body: any[] = new Array();

        //   doc.text(this.margine.left + (fontsize / 2), currentY + LineFeed, title);

        const table1: any = [];
        for (let i = 0; i < KEYS.length; i++) {
          const key: string = KEYS[i];
          const elieli = json[index]; // 1行分のnodeデータを取り出す
          const elist = elieli[key]; // 1行分のnodeデータを取り出す.
          const table: any = [];
          for (const k of Object.keys(elist)) {
            const item = elist[k];
            // 印刷する1行分のリストを作る
            const line = ["", "", "", "", "", "", "", ""];
            line[0] = item.id.toString();
            line[1] = item.dx.toFixed(4);
            line[2] = item.dy.toFixed(4);
            line[3] = item.dz.toFixed(4);
            line[4] = item.rx.toFixed(4);
            line[5] = item.ry.toFixed(4);
            line[6] = item.rz.toFixed(4);
            line[7] = item.case;
            body.push(line);
            row++;

            //１テーブルで59行以上データがあるならば
            if (row > 59) {
              table.push(body);
              body = [];
              row = 2;
            }
          }
          typeName.push(key);
          table1.push(table);
          if (body.length > 0) {
            table.push(body);
          }
          splid.push(table);
        }
        // body.push(table1);
        typeSum.push(typeName);

        //最後のページの行数だけ取得している
        const lastArray = splid.slice(-1)[0];
        const lastArrayCount = lastArray.length;
      }
      return { titleSum, splid, typeSum, break_after_case, break_after_type };
    }
  }
}
