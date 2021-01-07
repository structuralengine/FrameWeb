import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-print-input-define',
  templateUrl: './print-input-define.component.html',
  styleUrls: ['./print-input-define.component.scss','../../../../app.component.scss','../invoice.component.scss']
})
export class PrintInputDefineComponent implements OnInit, AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public define_dataset = [];

  constructor( private InputData: InputDataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

   const defineJson: any = this.InputData.define.getDefineJson();
    if (Object.keys(defineJson).length > 0) {
      this.define_dataset = this.printDefine(defineJson);

    }
  }

    // DEFINEデータ  を印刷する
    private printDefine(json): any {

      //let printAfterInfo: any;
  
      const dataCount: number = Object.keys(json).length;
  
      const body: any = [];
      for (const index of Object.keys(json)) {
  
        const item = json[index]; // 1行分のnodeデータを取り出す
  
        // 印刷する1行分のリストを作る
        let line: string[] = new Array();
        line.push(index); // DefineNo
        let counter: number = 0;
        const table: any = [];
        for (const key of Object.keys(item)) {
          //  if (key === 'row') { continue; }
          line.push(item[key]);
          counter += 1;
          if (counter === 10) {
            body.push(line); // 表の1行 登録
            counter = 0;
            line = new Array();
            line.push(''); // DefineNo
          }
        }
        if (counter > 0) {
          body.push(line); // 表の1行 登録
        }
      }
  
      return body;
    }

}
