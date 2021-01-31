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

  public elements_table = [];
  public elements_break = [];
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

      const tables = this.printElement(inputJson); 
      // { 
      //   table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      //   title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      //   this: countTotal, // 全体の高さ
      //   break_after: break_aft
      
       // 各タイプの前に改ページ（break_after）が必要かどうか判定
      // };

      this.elements_table = tables.table;
      this.elements_break = tables.break_after;
      this.elements_typeNum = tables.title;
      this.judge = this.countArea.setCurrentY(tables.this);
    }
  }

  ngAfterViewInit(){

  }

  // 材料データ element を印刷する
  private printElement(inputJson): any {
    const json: {} = inputJson["element"]; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);
    
    // 全体の高さを計算する
    let countCell = 0;
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のデータを取り出す
      countCell += (Object.keys(elist).length + 1) * 20;
    }
    const countHead = keys.length * 2 * 20;
    const countTotal = countCell + countHead + 40;
  
    // 各タイプの前に改ページ（break_after）が必要かどうか判定する
    const break_after: boolean[] = new Array();
    let ROW = 0
    for (const index of keys) {
      ROW += 2; // 行
      const elist = json[index]; // 1テーブル分のデータを取り出す
      const countCell = elist.length;
      ROW += countCell;

      if(ROW < 59){
        break_after.push(false)
      } else {
        break_after.push(true);
        ROW = 0
      }
    }

    // テーブル
    const splid: any = [];
    const title: string[] = new Array();
    for (const index of keys) {

      const table: any = []; // この時点でリセット、再定義 一旦空にする

      const elist = json[index]; // 1テーブル分のnodeデータを取り出す
      title.push(index.toString());

      let body: any = [];
      let row = 2; // タイトル行
      for (const key of Object.keys(elist)){
        const item = elist[key];

        const line = ["", "", "", "", "", "", "",""];
        line[0] = key;
        line[1] = item.A.toExponential(2);
        line[2] = item.E.toExponential(2);
        line[3] = item.G.toExponential(2);
        line[4] = item.Xp.toExponential(2);
        line[5] = item.Iy.toFixed(6);
        line[6] = item.Iz.toString(6);
        line[7] = item.J.toFixed(4);
        body.push(line);
        row ++;

        //１テーブルで59行以上データがあるならば
        if(row > 59){
          table.push(body);
          body = [];
          row = 2;
        }

      }

      if(body.length > 0){
        table.push(body);
      }

      splid.push(table);

    }

    return { 
      table: splid, // [タイプ１のテーブルリスト[], タイプ２のテーブルリスト[], ...]
      title: title, // [タイプ１のタイトル, タイプ２のタイトル, ... ]
      this: countTotal, // 全体の高さ
      break_after: break_after // 各タイプの前に改ページ（break_after）が必要かどうか判定
    };

    /*
    let body: any = [];
    const splid: any = [];

    let page: number = 0;

    let break_flg = true;

    // while (break_flg) {
    for (const index of keys) {
      const elist = json[index]; // 1テーブル分のnodeデータを取り出す
      const keysContents : string[] = Object.keys(elist);
      title.push(index.toString());
      const table: any = []; // この時点でリセット、再定義 一旦空にする
      if (elist.length > 59) {
        while (break_flg) {
          for (let i = 0; i < this.bottomCell; i++) {
            const line = ["", "", "", "", "", "", "", ""];
            let index: string = keys[i];
            const item = json[index]; // 1行分のnodeデータを取り出す
            const len: number = this.InputData.member.getMemberLength(index); // 部材長さ
            const j = page * 59 + i + 1;
            const s = j + 1;

            if (s > keys.length) {
              break_flg = false;
              break;
            }

            line[0] = index;
            line[1] = item.A.toExponential(2);
            line[2] = item.E.toExponential(2);
            line[3] = item.Xp.toExponential(2);
            line[4] = item.Iy.toFixed(6);
            line[5] = item.Iz.toString(6);
            line[6] = item.J.toFixed(4);

            body.push(line);
          }
          if (body.length === 0) {
            break;
          }
          splid.push(body);
          body = [];
          page++;
        }
        const lastArray2 = splid.slice(-1)[0];
        const lastArrayCount2 = lastArray2.length;
        this.judgeType = this.countArea.setCurrentElements(lastArrayCount2);
      } else {
        const elen = elist.length;
        for(let i = 0; i < elen ; i++){
          const line = ["", "", "", "", "", "", "", ""];
            let index: string = keys[i];
            const item = json[index]; // 1行分のnodeデータを取り出す
            const j = page * 59 + i + 1;
            const s = j + 1;

            if (s > keys.length) {
              break_flg = false;
              break;
            }

            line[0] = index;
            line[1] = item.A.toExponential(2);
            line[2] = item.E.toExponential(2);
            line[3] = item.Xp.toExponential(2);
            line[4] = item.Iy.toFixed(6);
            line[5] = item.Iz.toString(6);
            line[6] = item.J.toFixed(4);

            body.push(line);
        }
        table.push(body);
        this.judgeType = this.countArea.setCurrentElements(elen);

      }
      if(this.judgeType === true){
        page++;
      }
    
      this.countCell = (Object.keys(elist).length + 1) * 20;
      body.push(table);
    }
    
    this.countHead = keys.length * 2 * 20;
    this.countTotal = this.countCell + this.countHead + 40;
    return { body, title, this: this.countTotal, break_after: break_after };

    */
  }
}
