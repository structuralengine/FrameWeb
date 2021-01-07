import { Component, OnInit } from '@angular/core';
import { InputDataService } from '../../../../providers/input-data.service';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-print-input-fix-node',
  templateUrl: './print-input-fix-node.component.html',
  styleUrls: ['./print-input-fix-node.component.scss', '../../../../app.component.scss']
})
export class PrintInputFixNodeComponent implements OnInit,AfterViewInit {
  page: number;
  load_name: string;
  collectionSize: number;
  btnPickup: string;
  tableHeight: number;
  invoiceIds: string[];
  invoiceDetails: Promise<any>[];

  public fixNode_dataset = [];
  public fixNode_typeNum = [];  

  constructor( private InputData: InputDataService ) { }

  ngOnInit(): void {
  }

  
  ngAfterViewInit() {

    const inputJson: any = this.InputData.getInputJson(0);

    if ('fix_node' in inputJson) {
      const tables = this.printFixnode(inputJson); // {body, title}
      this.fixNode_dataset = tables.body;
      this.fixNode_typeNum = tables.title;
    }
  }
  
  // 支点データ fix_node を印刷する
  private printFixnode(inputJson): any {

    const json: {} = inputJson['fix_node'];
    const keys: string[] = Object.keys(json);
    const body: any = [];
    // const table: any = []; // 下に移動
    const title: string[] = new Array();
    for (const index of Object.keys(json)) {
      const elist = json[index]; // 1行分のnodeデータを取り出す
      title.push(index.toString());

      const table: any = []; // この時点でリセット、再定義 一旦空にする
      for (const key of Object.keys(elist)) {
        const item = elist[key];
        // 印刷する1行分のリストを作る

        const line: string[] = new Array();
        line.push(item.n);
        line.push(item.tx.toString());
        line.push(item.ty.toString());
        line.push(item.tz.toString());
        line.push(item.rx.toString());
        line.push(item.ry.toString());
        line.push(item.rz.toString());
        table.push(line);

      }
      body.push(table);
    }
    return { body, title };
  }

}