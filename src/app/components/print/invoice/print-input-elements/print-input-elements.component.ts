import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-print-input-elements',
  templateUrl: './print-input-elements.component.html',
  styleUrls: ['./print-input-elements.component.scss', '../../../../app.component.scss']
})
export class PrintInputElementsComponent implements OnInit, AfterViewInit  {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];
  public elements_dataset = [];
  public elements_typeNum = [];
  constructor( 
    private InputData: InputDataService
    ) {}


  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

    if ('element' in inputJson) {
      const tables = this.printElement(inputJson); // {body, title}
      this.elements_dataset = tables.body;
      this.elements_typeNum = tables.title;
      console.log("dsaffds", tables)
    }

  }

   // 材料データ element を印刷する
  private printElement(inputJson): any {

    let printAfterInfo: any;

    const json: {} = inputJson['element']; // inputJsonからnodeだけを取り出す
    const keys: string[] = Object.keys(json);
    const body: any = [];
    let head: string[];
    let No: number = 1;
    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      title.push(index.toString());
      const elist = json[index]; // 1行分のnodeデータを取り出す

      // // あらかじめテーブルの高さを計算する
      // const dataCount: number = elist.length;;
      // const TableHeight: number = (dataCount + 3) * (fontsize * 2.3);

      // // はみ出るなら改ページ
      // if (currentY + TableHeight > (pageHeight - this.margine.top - this.margine.bottom)) { // はみ出るなら改ページ
      //   if (pageHeight - currentY < (pageHeight - this.margine.top - this.margine.bottom) / 2) { // かつ余白が頁の半分以下ならば
      //     doc.addPage();
      //     currentY = this.margine.top + fontsize;
      //     LineFeed = 0;
      //   }
      // }

      // if (No === 1) {
      //   doc.text(this.margine.left, currentY + LineFeed, "材料データ")
      // }
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
      body.push(table);
    }
    return { body, title };
  }

}
