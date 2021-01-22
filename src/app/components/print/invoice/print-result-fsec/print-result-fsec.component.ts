import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-print-result-fsec',
  templateUrl: './print-result-fsec.component.html',
  styleUrls: ['../../../../app.component.scss', '../invoice.component.scss', '../invoice.component.scss']
})
export class PrintResultFsecComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public fesc_dataset = [];
  public fesc_typeNum = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.fsec.getFsecJson();
    const tables = this.printForce(resultjson);
    this.fesc_dataset = tables.body;
    this.fesc_typeNum = tables.titleSum;
  }

  // 断面力データを印刷する
  private printForce(json): any {
    const titleSum: any = [];
    const body: any = new Array();

    // const fontsize: number = 10;
    // doc.setFontSize(fontsize);

    // const currentY = this.margine.top + fontsize;
    // let pageHeight = doc.internal.pageSize.height; // 841.89

    // doc.text(this.margine.left, currentY, "断面力")

    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      if (!Array.isArray(elist)) {
        continue;
      }

      // 荷重名称
      const title: any = [];
      let loadName: string = '';
      const l: any = this.InputData.load.getLoadNameJson(null, index);
      if (index in l) {
        loadName = l[index].name;
        title.push(['Case' + index, loadName]);
      }

      const table: any = [];

      // あらかじめテーブルの高さを計算する
      // daraCount += elist.length;
      // const TableHeight: number = (daraCount + 2) * (fontsize * 2.3);
      // if(body.length > 0){
      //   // はみ出るなら改ページ
      //   if (currentY + fontsize + TableHeight >= (pageHeight - this.margine.top - this.margine.bottom)) {
      //     doc.autoTable({
      //       theme: ['plain'],
      //       margin: {
      //         left: this.margine.left,
      //         right: this.margine.right
      //       },
      //       styles: { font: 'default', halign: "right" },
      //       startY: fontsize + currentY,
      //       head: [
      //         ['部材', '節点', '', 'FX', 'FY', 'FZ', 'MX', 'MY', 'MZ'],
      //         ['No.', 'No.', 'DIST', '(kN)', '(kN)', '(kN)', '(kN・m)', '(kN・m)', '(kN・m)']
      //       ],
      //       body: body,
      //     })
      //     body = new Array();
      //     daraCount = 0;
      //     doc.addPage();
      //   }
      // }

      //  body.push(['Case ' + index, { content: loadName, styles: { halign: "left" }, colSpan: 8 }]);

      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る
        const line: string[] = new Array();
        line.push(item.m);
        line.push(item.n);
        line.push(item.l.toFixed(3));
        line.push(item.fx.toFixed(2));
        line.push(item.fy.toFixed(2));
        line.push(item.fz.toFixed(2));
        line.push(item.mx.toFixed(2));
        line.push(item.my.toFixed(2));
        line.push(item.mz.toFixed(2));
        table.push(line);
      }
      titleSum.push(title);
      console.log("titlesum--------", titleSum)
      body.push(table);
    }

    // if(body.length > 0){
    //   doc.autoTable({
    //     theme: ['plain'],
    //     margin: {
    //       left: this.margine.left,
    //       right: this.margine.right
    //     },
    //     styles: { font: 'default', halign: "right" },
    //     startY: fontsize + currentY,
    //     head: [
    //       ['部材', '節点', '', 'FX', 'FY', 'FZ', 'MX', 'MY', 'MZ'],
    //       ['No.', 'No.', 'DIST', '(kN)', '(kN)', '(kN)', '(kN・m)', '(kN・m)', '(kN・m)']
    //     ],
    //     body: body,
    //   })
    // }
    return { titleSum, body };
  }

}


