import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-print-result-disg',
  templateUrl: './print-result-disg.component.html',
  styleUrls: ['../../../../app.component.scss', '../invoice.component.scss', '../invoice.component.scss']
})
export class PrintResultDisgComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public disg_dataset = [];
  public disg_typeNum = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson : any = this.ResultData.disg.getDisgJson();
    const tables = this.printDisg(resultjson);
    this.disg_dataset = tables.body;
    this.disg_typeNum = tables.titleSum;
  }

  // 変位量データを印刷する
  private printDisg(json): any {
    const titleSum: any = [];
    const body: any[] = new Array();
    // let daraCount: number = 0;
   // const title: any = [];
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
        title.push(['Case' + index,loadName]);
      }
      
      const table: any = [];
      // あらかじめテーブルの高さを計算する
     // daraCount += elist.length;
      //if (body.length > 0) {
        // はみ出るなら改ページ
        // if (currentY + fontsize + TableHeight >= (pageHeight - this.margine.top - this.margine.bottom)) {
        //   doc.autoTable({
        //     theme: ['plain'],
        //     margin: {
        //       left: this.margine.left,
        //       right: this.margine.right
        //     },
        //     styles: { font: 'default', halign: "right" },
        //     startY: fontsize + currentY,
        //     head: [
        //       ['節点', 'X-Disp', 'Y-Disp', 'Z-Disp', 'X-Rotation', 'Y-Rotation', 'Z-Rotation'],
        //       ['No.', '(mm)', '(mm)', '(mm)', '(mRad)', '(mRad)', '(mRad)']
        //     ],
        //     body: body,
        //   })
        //   body = new Array();
        //   daraCount = 0;
        //   doc.addPage();
        // }
     // }

      // body.push(['Case ' + index, { content: loadName, styles: { halign: "left" }, colSpan: 7 }]);

      for (const key of Object.keys(elist)) {
        // 印刷する1行分のリストを作る
        const item = elist[key];
        // console.log("item--------" , item);
        const line: string[] = new Array();
        line.push(item.id.toString());
        line.push(item.dx.toFixed(4));
        line.push(item.dy.toFixed(4));
        line.push(item.dz.toFixed(4));
        line.push(item.rx.toFixed(4));
        line.push(item.ry.toFixed(4));
        line.push(item.rz.toFixed(4));
        table.push(line);
      }
      titleSum.push(title);
      console.log("titlesum--------" , titleSum)
      body.push(table);
    }

    // if(body.length > 0) {
    // doc.autoTable({
    //   theme: ['plain'],
    //   margin: {
    //     left: this.margine.left,
    //     right: this.margine.right
    //   },
    //   styles: { font: 'default', halign: "right" },
    //   startY: fontsize + currentY,
    //   head: [
    //     ['節点', 'X-Disp', 'Y-Disp', 'Z-Disp', 'X-Rotation', 'Y-Rotation', 'Z-Rotation'],
    //     ['No.', '(mm)', '(mm)', '(mm)', '(mRad)', '(mRad)', '(mRad)']
    //   ],
    //   body: body,
    // })
    // }
    return { titleSum ,  body };
  }

}
