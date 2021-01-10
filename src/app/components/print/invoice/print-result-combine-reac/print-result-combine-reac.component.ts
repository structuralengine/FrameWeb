import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-print-result-combine-reac',
  templateUrl: './print-result-combine-reac.component.html',
  styleUrls: ['../../../../app.component.scss','../invoice.component.scss','../invoice.component.scss']
})
export class PrintResultCombineReacComponent implements OnInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public combReac_dataset = [];
  public combReac_title = [];
  public combReac_type = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.combreac.reacCombine;
    const tables = this.printCombReact(resultjson);
    this.combReac_dataset = tables.body;
    this.combReac_title = tables.titleSum;
    this.combReac_type = tables.typeSum;
  }

  private printCombReact(json): any{

    const KEYS = ['tx_max', 'tx_min', 'ty_max', 'ty_min', 'tz_max', 'tz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
    // const TITLES = ['x方向の支点反力 最大', 'x方向の支点反力 最小', 'y方向の支点反力 最大', 'y方向の支点反力 最小', 'z方向の支点反力 最大', 'Z方向の支点反力 最小',
    //   'x軸回りの回転反力 最大', 'x軸回りの回転反力 最小', 'y軸回りの回転反力 最大', 'y軸回りの回転反力 最小', 'z軸回りの回転反力 最大', 'Z軸回りの回転反力 最小'];

    const titleSum: any = [];
    const body: any[] = new Array();
    const typeSum : any = [];

    for (const index of Object.keys(json)) {
      const typeName : any = [];
        // 荷重名称
        const title: any = [];
        let loadName: string = '';
        //const l: any = this.InputData.load.getLoadNameJson(null, index);
      const combineJson: any =  this.InputData.combine.getCombineJson();
        if (index in combineJson) {
          if ('name' in combineJson[index]) {
            loadName = combineJson[index].name;
            title.push(['Case' + index, loadName]);
          }else{
            title.push(['Case' + index]);
          }
        }
        titleSum.push(title);

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
          line.push(item.id.toString());
          line.push(item.tx.toFixed(2));
          line.push(item.ty.toFixed(2));
          line.push(item.tz.toFixed(2));
          line.push(item.mx.toFixed(2));
          line.push(item.my.toFixed(2));
          line.push(item.mz.toFixed(2));
          line.push(item.case);
          table.push(line);
        }
        typeName.push(key);
        table1.push(table);
       
       }
       body.push(table1);
       typeSum.push(typeName);
     }
    
     return { titleSum, body ,typeSum };
  }


}



