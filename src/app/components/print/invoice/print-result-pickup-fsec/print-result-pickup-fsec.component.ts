import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { ResultDataService } from '../../../../providers/result-data.service';
import { AfterViewInit } from '@angular/core';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-print-result-pickup-fsec',
  templateUrl: './print-result-pickup-fsec.component.html',
  styleUrls: ['./print-result-pickup-fsec.component.scss','../../../../app.component.scss', '../invoice.component.scss',]
})
export class PrintResultPickupFsecComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public pickFsec_dataset = [];
  public pickFsec_title = [];
  public pickFsec_type = [];

  constructor(private InputData: InputDataService,
    private ResultData: ResultDataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // const json: {} = this.ResultData.disg.getDisgJson();
    const resultjson: any = this.ResultData.pickfsec.fsecPickup;
    const tables = this.printPickForce(resultjson);
    this.pickFsec_dataset = tables.body;
    this.pickFsec_title = tables.titleSum;
    this.pickFsec_type = tables.typeSum;
  }

  private printPickForce(json):any {

    const KEYS = ['fx_max', 'fx_min', 'fy_max', 'fy_min', 'fz_max', 'fz_min', 'mx_max', 'mx_min', 'my_max', 'my_min', 'mz_max', 'mz_min'];
    //const TITLES = ['軸方向力 最大', '軸方向力 最小', 'y方向のせん断力 最大', 'y方向のせん断力 最小', 'z方向のせん断力 最大', 'z方向のせん断力 最小',
    //  'ねじりモーメント 最大', 'ねじりモーメント 最小', 'y軸回りの曲げモーメント 最大', 'y軸回りの曲げモーメント力 最小', 'z軸回りの曲げモーメント 最大', 'z軸回りの曲げモーメント 最小'];
  
    const titleSum: any = [];
    const body: any[] = new Array();
    const typeSum : any = [];

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
          line.push(item.m);
          line.push(item.n);
          line.push(item.l.toFixed(3));
          line.push(item.fx.toFixed(2));
          line.push(item.fy.toFixed(2));
          line.push(item.fz.toFixed(2));
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
