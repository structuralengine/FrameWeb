import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-print-input-combine',
  templateUrl: './print-input-combine.component.html',
  styleUrls: ['./print-input-combine.component.scss','../../../../app.component.scss']
})
export class PrintInputCombineComponent implements OnInit , AfterViewInit{
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public comb_dataset = [];

  constructor( private InputData: InputDataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

    const combineJson: any = this.InputData.combine.getCombineJson();
    if (Object.keys(combineJson).length > 0) {
      this.comb_dataset = this.printCombine(combineJson);
    }
  }


  // COMBINEデータ  を印刷する
  private printCombine(json): any {

    // あらかじめテーブルの高さを計算する
    const dataCount: number = Object.keys(json).length;

    const body: any = [];
    for (const index of Object.keys(json)) {

      const item = json[index]; // 1行分のnodeデータを取り出す

      if (index == "3") {
        console.log("2番目の処理が正常に完了")
      }

      // 印刷する1行分のリストを作る
      let line1: any[] = new Array();
      let line2: string[] = new Array();
      line1.push(index); // CombNo
      line2.push('');
      if ('name' in item) {
        line1.push(item.name); // 荷重名称
      } else {
        line1.push('');
      }
      line2.push('');

      if (index == "1") {
        console.log("2番目の処理が正常に完了");
        console.log("1", line1)
      }

      let counter: number = 0;
      for (const key of Object.keys(item)) {
        if (key === 'row') { continue; }
        if (key === 'name') { continue; }
        line1.push(key.replace('C', ''));
        line2.push(item[key]);
        counter += 1;
        if (counter === 8) {
          body.push(line1); // 表の1行 登録
          body.push(line2);
          counter = 0;
          line1 = new Array();
          line2 = new Array();
          line1.push(''); // CombNo
          line2.push('');
          line1.push(''); // 荷重名称
          line2.push('');
        }
      }
      if (counter > 0) {
        body.push(line1); // 表の1行 登録
        body.push(line2);
      }
    }
    return body;
  }

}
