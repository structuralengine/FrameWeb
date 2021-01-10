import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';


@Component({
  selector: 'app-print-result-pickup-disg',
  templateUrl: './print-result-pickup-disg.component.html',
  styleUrls: ['./print-result-pickup-disg.component.scss','../../../../app.component.scss', '../invoice.component.scss',]
})
export class PrintResultPickupDisgComponent implements OnInit,AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public pickDisg_dataset = [];
  public pickDisg_title = [];
  public pickDisg_type = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) { }

  ngOnInit(): void {
  }

   ngAfterViewInit() {

    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.pickdisg.disgPickup;
    const tables = this.printPickDisg(resultjson);
    this.pickDisg_dataset = tables.body;
    this.pickDisg_title = tables.titleSum;
    this.pickDisg_type = tables.typeSum;
  }

   // 変位量データを印刷する
  private printPickDisg(json): any {
    const titleSum: any = [];
    const body: any[] = new Array();
    const typeSum : any = [];

    const KEYS = ['dx_max', 'dx_min', 'dy_max', 'dy_min', 'dz_max', 'dz_min', 'rx_max', 'rx_min', 'ry_max', 'ry_min', 'rz_max', 'rz_min'];
    // const TITLES = ['x方向の移動量 最大', 'x方向の移動量 最小', 'y方向の移動量 最大', 'y方向の移動量 最小', 'z方向の移動量 最大', 'Z方向の移動量 最小',
    //   'x軸回りの回転角 最大', 'x軸回りの回転角 最小', 'y軸回りの回転角 最大', 'y軸回りの回転角 最小', 'z軸回りの回転角 最大', 'Z軸回りの回転角 最小'];

    // let jsonData: object;
    // if (mode === 'COMBINE') {
    //   jsonData = this.ResultData.combdisg.disgCombine;
    // } else {
    //   jsonData = this.ResultData.pickdisg.disgPickup;
    // }

    // const fontsize: number = 10;

    // let currentY = this.margine.top + fontsize;
    // const pageHeight = doc.internal.pageSize.height; // 841.89
    // const LineFeed = fontsize * 2;

    // doc.text(this.margine.left, currentY, mode + " 変位量");

    for (const index of Object.keys(json)) {
      const typeName : any = [];
        // 荷重名称
        const title: any = [];
        let loadName: string = '';
        //const l: any = this.InputData.load.getLoadNameJson(null, index);
      const combineJson: any =  this.InputData.pickup.getPickUpJson();
        if (index in combineJson) {
          if ('name' in combineJson[index]) {
            loadName = combineJson[index].name;
            title.push(['Case' + index, loadName]);
          }else{
            title.push(['Case' + index]);
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
          const line: string[] = new Array();
          line.push(item.id);
          line.push(item.dx.toFixed(4));
          line.push(item.dy.toFixed(4));
          line.push(item.dz.toFixed(4));
          line.push(item.rx.toFixed(4));
          line.push(item.ry.toFixed(4));
          line.push(item.rz.toFixed(4));
          line.push(item.case);
          table.push(line);
        }
       typeName.push(key);
       table1.push(table);
      
      }
      body.push(table1);
      typeSum.push(typeName);

      // let printAfterInfo: any;
      // doc.autoTable({
      //   theme: ['plain'],
      //   margin: {
      //     left: this.margine.left + fontsize,
      //     right: this.margine.right
      //   },
      //   styles: { font: 'default', halign: "right" },
      //   startY: currentY + LineFeed + fontsize,
      //   head: [
      //     ['節点', 'X-Disp', 'Y-Disp', 'Z-Disp', 'X-Rotation', 'Y-Rotation', 'Z-Rotation', 'comb'],
      //     ['No.', '(mm)', '(mm)', '(mm)', '(mRad)', '(mRad)', '(mRad)', '']
      //   ],
      //   body: body,
      //   didParseCell: function (CellHookData) {
      //     printAfterInfo = CellHookData;
      //   }
      // });
      // body = new Array();
      // if (i < KEYS.length - 1) { // 最後のページ以外
      //   const TableHeight = printAfterInfo.table.finalY - currentY;
      //   const nextTablebottom = printAfterInfo.table.finalY + this.defaultLinefeed + TableHeight;
      //   if (nextTablebottom >= (pageHeight - this.margine.top - this.margine.bottom)) {
      //     doc.addPage();
      //     currentY = this.margine.top + fontsize;
      //     doc.text(this.margine.left, currentY, mode + " 変位量")
      //   } else {
      //     currentY = printAfterInfo.table.finalY + this.defaultLinefeed;
      //   }
      // }
    }
    return { titleSum, body ,typeSum };
  } 

}
